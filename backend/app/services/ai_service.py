import os
from anthropic import Anthropic
from typing import List, Optional
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
                max_tokens=8000,
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
    
    def _build_prompt(
        self, 
        query: str, 
        num_playlists: int,
        target_duration: Optional[int]
    ) -> str:
        """Build the prompt for Claude"""
        
        duration_guidance = f"\n- Target duration: approximately {target_duration} minutes" if target_duration else ""
        
        prompt = f"""You are a professional DJ with deep knowledge of electronic music, mixing techniques, and crowd dynamics. 

User Request: "{query}"

Generate {num_playlists} different setlist options based on this request. For each setlist, provide:

1. A creative name
2. A brief description of the vibe and style
3. BPM range (e.g., "120-130")
4. Energy progression (e.g., "Gradual build", "High energy throughout", "Peak and valleys")
5. Recommended track count (typically 15-25 tracks for a 60-90 min set)
6. Key characteristics (genres, moods, special elements)
7. 10-15 specific track suggestions with:
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
