import os
from anthropic import Anthropic
from typing import Optional
import json

class AIService:
    def __init__(self):
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            print("⚠️  Anthropic API key not configured - AI features will be disabled")
            self.client = None
            return

        self.client = Anthropic(api_key=api_key)
    
    def generate_setlist(
        self, 
        query: str,
        num_playlists: int = 2,
        target_duration: Optional[int] = None
    ) -> dict:
        """
        Generate setlist suggestions based on natural language query
        
        Args:
            query: User's description of desired vibe/style
            num_playlists: Number of playlist options to generate (1-3)
            target_duration: Target duration in minutes (optional)
        
        Returns:
            Dict containing generated playlists with track suggestions
        """
        
        if not self.client:
            raise RuntimeError("AI service is not available - Anthropic API key not configured")

        # Build the prompt for Claude
        prompt = self._build_prompt(query, num_playlists, target_duration)
        
        try:
            # Call Claude API
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=16000,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            # Check if response was truncated
            if message.stop_reason == "max_tokens":
                raise RuntimeError("AI response was truncated - the generated setlist was too large. Try requesting fewer playlists or tracks.")

            # Extract and parse response
            response_text = message.content[0].text

            # Strip markdown code fences if Claude wrapped the JSON
            response_text = response_text.strip()
            if response_text.startswith("```"):
                # Remove opening fence (with optional language tag)
                response_text = response_text.split("\n", 1)[1] if "\n" in response_text else response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            # Parse JSON response
            result = json.loads(response_text)

            return result

        except json.JSONDecodeError as e:
            print(f"Failed to parse AI response as JSON: {e}")
            raise RuntimeError(f"AI returned invalid JSON. Please try again.")
        except Exception as e:
            print(f"Error calling Claude API: {e}")
            raise
    
    def refine_setlist(self, refinement: str, current_playlist: dict) -> dict:
        """Refine an existing playlist based on user feedback."""
        if not self.client:
            raise RuntimeError("AI service is not available - Anthropic API key not configured")

        current_json = json.dumps(current_playlist, indent=2)

        prompt = f"""You are a professional DJ assistant. The user has an AI-generated setlist and wants to refine it.

Here is the current setlist:
{current_json}

User's refinement request: "{refinement}"

Modify the setlist based on the user's request. You can:
- Add, remove, or replace tracks
- Change the order of tracks
- Adjust BPM ranges, energy levels, or genres
- Update the name, description, or any other metadata
- Make any changes the user asks for

Keep the same JSON structure. Return ONLY the modified playlist as a valid JSON object (no markdown, no backticks) in this exact format:

{{
  "playlists": [
    {{
      "name": "...",
      "description": "...",
      "bpm_range": "...",
      "energy_progression": "...",
      "recommended_track_count": ...,
      "total_duration_estimate": ...,
      "genres": [...],
      "key_characteristics": [...],
      "tracks": [
        {{
          "title": "...",
          "artist": "...",
          "bpm": ...,
          "key": "...",
          "energy": ...,
          "position": "...",
          "reasoning": "..."
        }}
      ],
      "transition_notes": [...]
    }}
  ]
}}"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=16000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            if message.stop_reason == "max_tokens":
                raise RuntimeError("AI response was truncated. Try a simpler refinement.")

            response_text = message.content[0].text.strip()
            if response_text.startswith("```"):
                response_text = response_text.split("\n", 1)[1] if "\n" in response_text else response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            return json.loads(response_text)

        except json.JSONDecodeError as e:
            print(f"Failed to parse AI refinement response as JSON: {e}")
            raise RuntimeError("AI returned invalid JSON. Please try again.")
        except Exception as e:
            print(f"Error calling Claude API for refinement: {e}")
            raise

    def _build_prompt(
        self, 
        query: str, 
        num_playlists: int,
        target_duration: Optional[int]
    ) -> str:
        """Build the prompt for Claude"""
        
        # Estimate track count from duration (avg ~4 min per track)
        if target_duration:
            track_count = max(8, round(target_duration / 4))
            duration_guidance = f"\n- Target duration: approximately {target_duration} minutes\n- You MUST provide exactly {track_count} tracks to fill the full duration (approximately 1 track per 3-5 minutes)"
            track_instruction = f"Exactly {track_count} specific track suggestions (enough to fill {target_duration} minutes)"
        else:
            duration_guidance = "\n- Determine the appropriate set length based on the context of the user's request (e.g., warm-up sets are typically 60 min / ~15 tracks, peak time sets 90-120 min / ~25-30 tracks, festival headliners 60-90 min / ~15-22 tracks, opening sets 60 min / ~15 tracks, closing/afterparty sets 120-180 min / ~30-45 tracks). Use your DJ expertise to pick the right length."
            track_instruction = "The appropriate number of specific track suggestions to fill the set duration you've determined (do NOT limit to 10-15 — provide as many tracks as the set requires)"

        prompt = f"""You are a professional DJ with deep knowledge of electronic music, mixing techniques, and crowd dynamics.

User Request: "{query}"

Generate {num_playlists} different setlist options based on this request. For each setlist, provide:

1. A creative name
2. A brief description of the vibe and style
3. BPM range (e.g., "120-130")
4. Energy progression (e.g., "Gradual build", "High energy throughout", "Peak and valleys")
5. Recommended track count
6. Key characteristics (genres, moods, special elements)
7. {track_instruction} with:
   - Track name (can be real or stylistically appropriate examples)
   - Artist name
   - BPM (approximate)
   - Key in Camelot notation (1A-12B)
   - Energy level (1-10)
   - Position in set (opener, build, peak, transition, closer)
   - Brief reason for inclusion

Guidelines:{duration_guidance}
- Consider harmonic mixing (Camelot wheel compatibility)
- Plan smooth BPM transitions (±6 BPM is smooth, ±15 is moderate)
- Create an intentional energy arc
- Include specific transition notes between key moments
- Consider the context (warm-up, peak time, closing, etc.)

Return ONLY a valid JSON object in this exact format (no markdown, no backticks):

{{
  "playlists": [
    {{
      "name": "Setlist name here",
      "description": "Description of vibe and approach",
      "bpm_range": "120-130",
      "energy_progression": "Gradual build from warm to peak",
      "recommended_track_count": 20,
      "total_duration_estimate": 90,
      "genres": ["Progressive House", "Melodic Techno"],
      "key_characteristics": ["Deep basslines", "Atmospheric pads", "Driving rhythms"],
      "tracks": [
        {{
          "title": "Track Name",
          "artist": "Artist Name",
          "bpm": 124,
          "key": "8A",
          "energy": 6,
          "position": "opener",
          "reasoning": "Sets the tone with deep, atmospheric vibes"
        }}
      ],
      "transition_notes": [
        "Tracks 1-3: Establish foundation with consistent 124 BPM",
        "Track 5-7: Increase energy, introduce more percussion",
        "Track 10-12: Peak section with highest energy"
      ]
    }}
  ]
}}"""
        
        return prompt

# Global instance
ai_service = AIService()
