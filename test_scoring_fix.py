import asyncio
import sys
import os

# Add scripts directory to path to import PTEScoringService
sys.path.append(os.path.join(os.getcwd(), 'scripts'))

try:
    from ai_scoring_service import PTEScoringService
except ImportError:
    print("Could not import PTEScoringService. Make sure you are in the project root.")
    sys.exit(1)

async def test_nonsense_scoring():
    service = PTEScoringService()
    
    # User's reported nonsense string
    nonsense_input = "gfuewirwgb cyiruw tvwi5ut cvyit85woc fjtnvciife"
    prompt = "Summarize the lecture in 50-70 words."
    
    print(f"Testing nonsense input: '{nonsense_input}'")
    
    try:
        result = await service.evaluate_writing(prompt, nonsense_input, "summarize_spoken_text")
        print("\n--- TEST RESULT ---")
        print(f"Overall Score: {result.details.get('overallScore')}")
        print(f"Grammar Score: {result.details.get('grammarScore')}")
        print(f"Spelling Score: {result.details.get('spellingScore')}")
        print(f"Vocabulary Score: {result.details.get('vocabularyScore')}")
        print(f"Feedback: {result.feedback}")
        
        # Validation checks
        if result.details.get('overallScore') == 0 and result.details.get('grammarScore') == 0:
            print("\n✅ SUCCESS: Logic correctly awarded 0 for nonsense input.")
        else:
            print("\n❌ FAILURE: Logic still awarding non-zero scores for nonsense.")
            
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    asyncio.run(test_nonsense_scoring())
