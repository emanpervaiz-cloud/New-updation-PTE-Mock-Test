#!/usr/bin/env python3
"""
AI Scoring Service for PTE Mock Test
Provides AI-based evaluation of speaking, writing, reading, and listening responses
"""

import os
import json
import asyncio
import aiohttp
from typing import Dict, Any, Optional
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class ScoreResult:
    """Data class for storing scoring results"""
    score: float
    feedback: str
    details: Dict[str, Any]

class PTEScoringService:
    def __init__(self):
        self.gemini_api_key = os.getenv("VITE_GEMINI_API_KEY")
        self.openrouter_api_key = os.getenv("VITE_OPENROUTER_API_KEY")
        self.openai_api_key = os.getenv("VITE_OPENAI_API_KEY")
        
        # System prompts for different PTE modules
        self.system_prompts = {
            "speaking": """You are a certified English language examiner specializing in high-stakes spoken English assessment, including PTE Academic, IELTS Speaking, and TOEFL iBT evaluations.

Your task is to evaluate a student's response with the precision, consistency, and constructive tone of a professional human examiner.

EVALUATION CRITERIA — Score each dimension out of 10. Be analytical, specific, and evidence-based — reference actual phrases or patterns from the student's response.

1. Fluency & Coherence (0–10): Assess speech flow, logical sequencing, use of discourse markers, and absence of unnatural pauses or repetition.
2. Pronunciation & Intonation (0–10): Assess phoneme accuracy, word stress, sentence rhythm, and natural intonation patterns. Note any L1 interference if detectable.
3. Grammatical Range & Accuracy (0–10): Assess variety of sentence structures (simple, compound, complex) and grammatical correctness. Note recurring error patterns.
4. Vocabulary & Lexical Resource (0–10): Assess range, precision, and appropriateness of word choice. Penalize overuse of basic vocabulary or repetition.
5. Task Achievement & Relevance (0–10): Assess whether the response fully addresses the prompt, stays on topic, and meets the expected length and depth.

EXAMINER STANDARDS:
- Never give generic feedback. Always cite evidence from the response.
- Maintain professional, encouraging, and growth-oriented tone.
- Penalize but do not discourage. Frame weaknesses as opportunities.
- Be consistent — same response quality must yield same score range every time.""",
            
            "writing": """You are an expert English writing evaluator for PTE Academic. Analyze the student's written response thoroughly and provide detailed, specific feedback.

CRITICAL: You must analyze the ACTUAL TEXT provided and give specific evidence-based scores. Do NOT give generic placeholder feedback.

EVALUATION CRITERIA — Score each dimension 0-10 with specific examples:

1. FLUENCY & COHERENCE (0-10): 
   - Analyze paragraph structure and logical flow
   - Identify specific cohesive devices used (however, furthermore, consequently, etc.)
   - Quote transitions between paragraphs
   - Score: 8+ for excellent flow, 5-7 for adequate, below 5 for poor organization

2. SPELLING & PUNCTUATION (0-10):
   - Count and list specific spelling errors with corrections
   - Identify punctuation mistakes (comma splices, missing periods, etc.)
   - Note capitalization errors
   - Score: 9-10 for 0-1 errors, 7-8 for 2-3 errors, below 7 for 4+ errors

3. GRAMMAR RANGE & ACCURACY (0-10):
   - Identify sentence structure variety (simple/compound/complex/compound-complex)
   - List specific grammar errors with corrections (subject-verb agreement, tense errors, article usage)
   - Count error frequency
   - Score: 8+ for advanced structures with few errors, 6-7 for good range with some errors, below 6 for basic structures or many errors

4. VOCABULARY & LEXICAL RESOURCE (0-10):
   - Identify overused words and suggest alternatives
   - Note academic vocabulary usage
   - Comment on word precision and appropriateness
   - Score: 8+ for sophisticated academic vocabulary, 6-7 for adequate range, below 6 for repetitive/basic vocabulary

5. TASK ACHIEVEMENT (0-10):
   - Confirm the response addresses ALL parts of the prompt
   - Check word count appropriateness
   - Evaluate argument development and support
   - Score: 8+ for fully developed response, 6-7 for adequate, below 6 for incomplete
   - NONSENSE/NON-ENGLISH: An absolute 0 MUST be awarded for ALL categories if the response is random characters or non-English.

REQUIRED OUTPUT FORMAT:
{
  "fluencyScore": number,
  "pronunciationScore": number (for writing: spelling/punctuation),
  "grammarScore": number,
  "vocabularyScore": number,
  "taskScore": number,
  "overallScore": number,
  "feedback": "Detailed paragraph with specific examples from the text",
  "grammarErrors": ["Error 1 -> Correction 1", "Error 2 -> Correction 2"],
  "spellingErrors": ["misspelled -> correct"],
  "vocabularySuggestions": ["overused word -> better alternative"]
}""",
            
            "reading": """You are a PTE Academic reading examiner. Evaluate the student's reading comprehension and response accuracy.

EVALUATION CRITERIA:
1. Comprehension Accuracy (0-10): How accurately the student understood the passage
2. Detail Recognition (0-10): Ability to identify specific details from the text
3. Inference Skills (0-10): Ability to make logical inferences from the text
4. Vocabulary Understanding (0-10): Comprehension of academic vocabulary in context
5. Time Management (0-10): Efficiency in completing the task within time limits""",
            
            "listening": """You are a PTE Academic listening examiner. Evaluate the student's listening comprehension and response accuracy.

EVALUATION CRITERIA:
1. Comprehension Accuracy (0-10): How accurately the student understood the audio content
2. Detail Recognition (0-10): Ability to identify specific details from the audio
3. Contextual Understanding (0-10): Grasp of overall meaning and purpose
4. Vocabulary Recognition (0-10): Understanding of academic vocabulary heard
5. Note-taking Effectiveness (0-10): Quality of information captured during listening"""
        }

    async def evaluate_speaking(self, prompt: str, transcript: str, question_type: str = "speaking") -> ScoreResult:
        """Evaluate speaking responses using AI"""
        # Specific prompts for different PTE speaking tasks
        task_descriptions = {
            "read_aloud": "Read Aloud: The student must read a text aloud naturally and clearly.",
            "repeat_sentence": "Repeat Sentence: The student must repeat a sentence exactly as heard.",
            "describe_image": "Describe Image: The student must describe a graph, chart, or image.",
            "retell_lecture": "Retell Lecture: The student must summarize a lecture in their own words.",
            "answer_short_question": "Answer Short Question: The student must give a brief, accurate answer to a question."
        }
        
        task_info = task_descriptions.get(question_type, "Speaking task")
        
        evaluation_prompt = f"""Evaluate this {task_info} response for a PTE Academic exam.

Question/Prompt: {prompt}
Student's Transcript: {transcript}
Question Type: {question_type}

Please evaluate based on these criteria (score each 0-10):
1. Oral Fluency - speech flow, logical sequencing, discourse markers, unnatural pauses
2. Pronunciation - phoneme accuracy, word stress, sentence rhythm
3. Grammatical Range & Accuracy - sentence structures, grammatical correctness, error patterns
4. Vocabulary & Lexical Resource - word range, precision, appropriateness
5. Task Achievement - addresses prompt, stays on topic, expected length

Provide specific feedback with samples from the transcript. Identify:
- Grammar mistakes with corrections
- Fluency issues (pauses, repetitions)
- Pronunciation tips
- Vocabulary suggestions

Return JSON format:
{{
  "fluencyScore": number,
  "pronunciationScore": number,
  "grammarScore": number,
  "vocabularyScore": number,
  "taskScore": number,
  "overallScore": number,
  "feedback": "detailed feedback with specific examples",
  "grammarErrors": ["error1 -> correction1", "error2 -> correction2"],
  "fluencyIssues": ["issue1", "issue2"],
  "vocabularySuggestions": ["word1 -> alternative1"]
}}"""

        result = await self._call_ai_model(evaluation_prompt, self.system_prompts["speaking"])
        return ScoreResult(
            score=result.get("overallScore", 50),
            feedback=result.get("feedback", "Evaluation completed"),
            details=result
        )

    async def evaluate_writing(self, prompt: str, response: str, question_type: str = "writing") -> ScoreResult:
        """Evaluate writing responses using AI"""
        # Specific prompts for different PTE writing tasks
        task_descriptions = {
            "summarize_written_text": "Summarize Written Text: The student must write a one-sentence summary (5-75 words) of a passage.",
            "write_essay": "Write Essay: The student must write a 200-300 word argumentative essay."
        }
        
        task_info = task_descriptions.get(question_type, "Writing task")
        
        evaluation_prompt = f"""Evaluate this {task_info} response for PTE Academic:

PROMPT: {prompt}

STUDENT RESPONSE:
{response}

Please evaluate based on these criteria (score each 0-10):
1. Content & Relevance - how well the response addresses the prompt
2. Formal Requirement - word count and structure (e.g., single sentence for SWT)
3. Grammar - accuracy and range
4. Vocabulary - precision and range
5. Spelling & Punctuation - accuracy

Provide detailed evaluation with specific examples from the text. Return JSON as specified in system prompt."""

        result = await self._call_ai_model(evaluation_prompt, self.system_prompts["writing"])
        return ScoreResult(
            score=result.get("overallScore", 50),
            feedback=result.get("feedback", "Evaluation completed"),
            details=result
        )

    async def evaluate_reading(self, questions_with_answers: list) -> ScoreResult:
        """Evaluate reading responses using AI for qualitative feedback and objective scoring"""
        correct_count = 0
        total_count = len(questions_with_answers)
        
        results_detailed = []
        for question in questions_with_answers:
            correct = question.get('correct_answer') or question.get('correct')
            student_answer = question.get('response') or question.get('responses')
            is_correct = self._compare_answers(correct, student_answer)
            
            if is_correct:
                correct_count += 1
            
            results_detailed.append({
                "type": question.get('type', 'unknown'),
                "is_correct": is_correct,
                "student_answer": student_answer,
                "correct_answer": correct
            })
        
        accuracy_percentage = (correct_count / total_count * 100) if total_count > 0 else 0
        
        evaluation_prompt = f"""Analyze these PTE reading results:
Total Questions: {total_count}
Correct: {correct_count}
Accuracy: {accuracy_percentage}%

Performance breakdown:
{json.dumps(results_detailed, indent=2)}

Provide feedback on:
1. Types of questions where the student struggled
2. General pattern of errors
3. Specific advice for improvement

Return JSON format with a "feedback" field and a "suggestions" array."""
        
        ai_feedback = await self._call_ai_for_qualitative_feedback(evaluation_prompt, self.system_prompts["reading"])
        
        return ScoreResult(
            score=accuracy_percentage,
            feedback=ai_feedback.get("feedback", f"Student answered {correct_count} out of {total_count} questions correctly."),
            details={
                "correct_count": correct_count,
                "total_count": total_count,
                "accuracy_percentage": accuracy_percentage,
                "detailed_results": results_detailed,
                "suggestions": ai_feedback.get("suggestions", []),
                "source": ai_feedback.get("source", "ai")
            }
        )

    async def evaluate_listening(self, questions_with_answers: list) -> ScoreResult:
        """Evaluate listening responses using AI"""
        correct_count = 0
        total_count = len(questions_with_answers)
        
        results_detailed = []
        for question in questions_with_answers:
            correct = question.get('correct_answer') or question.get('correct')
            student_answer = question.get('response') or question.get('responses')
            is_correct = self._compare_answers(correct, student_answer)
            
            if is_correct:
                correct_count += 1
                
            results_detailed.append({
                "type": question.get('type', 'unknown'),
                "is_correct": is_correct,
                "student_answer": student_answer,
                "correct_answer": correct
            })
        
        accuracy_percentage = (correct_count / total_count * 100) if total_count > 0 else 0
        
        evaluation_prompt = f"""Analyze these PTE listening results:
Total Questions: {total_count}
Correct: {correct_count}
Accuracy: {accuracy_percentage}%

Performance breakdown:
{json.dumps(results_detailed, indent=2)}

Provide feedback on listening skills, note-taking, and accuracy. 
Return JSON format with a "feedback" field and a "suggestions" array."""
        
        ai_feedback = await self._call_ai_for_qualitative_feedback(evaluation_prompt, self.system_prompts["listening"])
        
        return ScoreResult(
            score=accuracy_percentage,
            feedback=ai_feedback.get("feedback", f"Student answered {correct_count} out of {total_count} questions correctly."),
            details={
                "correct_count": correct_count,
                "total_count": total_count,
                "accuracy_percentage": accuracy_percentage,
                "detailed_results": results_detailed,
                "suggestions": ai_feedback.get("suggestions", []),
                "source": ai_feedback.get("source", "ai")
            }
        )

    async def _call_ai_model(self, prompt: str, system_prompt: str) -> Dict[str, Any]:
        """Call AI model using available providers with robust tracking"""
        print(f"Calling AI model with prompt length: {len(prompt)}")
        
        providers = [
            ("Gemini", self._call_gemini),
            ("OpenRouter", self._call_openrouter),
            ("OpenAI", self._call_openai)
        ]
        
        for name, func in providers:
            try:
                print(f"Trying provider: {name}")
                result = await func(prompt, system_prompt)
                if result and result.get("overallScore") is not None:
                    print(f"Success with provider: {name}")
                    result['source'] = name
                    return result
            except Exception as e:
                print(f"Provider {name} failed: {str(e)}")
        
        print("All AI providers failed. Returning fallback evaluation.")
        return {
            "fluencyScore": 0,
            "pronunciationScore": 0,
            "grammarScore": 0,
            "vocabularyScore": 0,
            "taskScore": 0,
            "overallScore": 0,
            "feedback": "AI evaluation currently unavailable. Please check your API keys and internet connection.",
            "grammarErrors": [],
            "fluencyIssues": [],
            "source": "fallback"
        }

    async def _call_ai_for_qualitative_feedback(self, prompt: str, system_prompt: str) -> Dict[str, Any]:
        """Call AI model for feedback-oriented tasks (Reading/Listening)"""
        print(f"Calling AI model for qualitative feedback with prompt length: {len(prompt)}")
        
        providers = [
            ("Gemini", self._call_gemini),
            ("OpenRouter", self._call_openrouter),
            ("OpenAI", self._call_openai)
        ]
        
        for name, func in providers:
            try:
                print(f"Trying provider for feedback: {name}")
                result = await func(prompt, system_prompt)
                # For these tasks, we just need a valid dictionary response
                if isinstance(result, dict) and "feedback" in result:
                    result['source'] = name
                    return result
            except Exception as e:
                print(f"Provider {name} failed for feedback: {str(e)}")
        
        return {"feedback": "AI feedback is currently unavailable.", "suggestions": [], "source": "fallback"}

    async def _call_gemini(self, prompt: str, system_prompt: str) -> Dict[str, Any]:
        """Call Google Gemini API with better error checking"""
        # Use gemini-1.5-flash for faster response times in real-time scoring
        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key={self.gemini_api_key}"
        
        payload = {
            "contents": [{
                "parts": [
                    {"text": system_prompt},
                    {"text": prompt}
                ]
            }],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 2048
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=30) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'candidates' not in data or not data['candidates']:
                        raise ValueError(f"Gemini returned no candidates: {data}")
                        
                    text_response = data['candidates'][0]['content']['parts'][0]['text']
                    return self._parse_json_from_text(text_response)
                else:
                    error_text = await response.text()
                    raise Exception(f"Gemini API error {response.status}: {error_text}")

    def _parse_json_from_text(self, text: str) -> Dict[str, Any]:
        """Utility to extract JSON from AI text response"""
        import re
        try:
            # Try direct parse
            return json.loads(text)
        except:
            # Try regex extraction
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
        
        return {"overallScore": 50, "feedback": text}

    async def _call_openrouter(self, prompt: str, system_prompt: str) -> Dict[str, Any]:
        """Call OpenRouter API (supports multiple models)"""
        url = "https://openrouter.ai/api/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.openrouter_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "openai/gpt-4o",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"}
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        text_response = data['choices'][0]['message']['content']
                        
                        try:
                            return json.loads(text_response)
                        except:
                            return {"overallScore": 50, "feedback": text_response}
                    else:
                        print(f"OpenRouter API error: {response.status}")
                        return {"overallScore": 0, "feedback": "API error occurred"}
        except Exception as e:
            print(f"Error calling OpenRouter: {str(e)}")
            return {"overallScore": 0, "feedback": "API error occurred"}

    async def _call_openai(self, prompt: str, system_prompt: str) -> Dict[str, Any]:
        """Call OpenAI API"""
        url = "https://api.openai.com/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"}
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        text_response = data['choices'][0]['message']['content']
                        
                        try:
                            return json.loads(text_response)
                        except:
                            return {"overallScore": 50, "feedback": text_response}
                    else:
                        print(f"OpenAI API error: {response.status}")
                        return {"overallScore": 0, "feedback": "API error occurred"}
        except Exception as e:
            print(f"Error calling OpenAI: {str(e)}")
            return {"overallScore": 0, "feedback": "API error occurred"}

    def _compare_answers(self, correct, student) -> bool:
        """Enhanced answer comparison for PTE"""
        if not correct or not student:
            return False
            
        if isinstance(correct, str) and isinstance(student, str):
            # Normalise strings for comparison
            c = correct.lower().strip().replace('.', '').replace(',', '')
            s = student.lower().strip().replace('.', '').replace(',', '')
            return c == s
        elif isinstance(correct, list) and isinstance(student, list):
            return sorted([str(x).lower().strip() for x in correct]) == sorted([str(x).lower().strip() for x in student])
        elif isinstance(correct, list) and isinstance(student, str):
            return student.lower().strip() in [str(item).lower().strip() for item in correct]
        else:
            return str(correct).lower().strip() == str(student).lower().strip()

# Flask API endpoint for n8n integration
async def handle_n8n_request(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Handle requests from n8n webhook with improved logging"""
    scoring_service = PTEScoringService()
    
    action = payload.get('action', '')
    question_type = payload.get('questionType', payload.get('question_type', 'general'))
    
    print(f"Processing n8n request: action={action}, type={question_type}")
    
    try:
        if action == 'evaluate_speaking':
            prompt = payload.get('prompt', '')
            transcript = payload.get('transcript', '')
            result = await scoring_service.evaluate_speaking(prompt, transcript, question_type)
            return {"success": True, "result": result.details, "score": result.score, "feedback": result.feedback}
        
        elif action == 'evaluate_writing':
            prompt = payload.get('prompt', '')
            response = payload.get('response', '')
            result = await scoring_service.evaluate_writing(prompt, response, question_type)
            return {"success": True, "result": result.details, "score": result.score, "feedback": result.feedback}
        
        elif action == 'evaluate_reading':
            questions = payload.get('questions', [])
            result = await scoring_service.evaluate_reading(questions)
            return {"success": True, "result": result.details, "score": result.score, "feedback": result.feedback}
        
        elif action == 'evaluate_listening':
            questions = payload.get('questions', [])
            result = await scoring_service.evaluate_listening(questions)
            return {"success": True, "result": result.details, "score": result.score, "feedback": result.feedback}
        
        else:
            return {"success": False, "error": f"Unknown action: {action}"}
    
    except Exception as e:
        import traceback
        print(f"Error handling n8n request: {str(e)}")
        print(traceback.format_exc())
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Example usage
    import asyncio
    
    async def example():
        service = PTEScoringService()
        
        # Example speaking evaluation
        result = await service.evaluate_speaking(
            prompt="Describe the image showing a busy city street.",
            transcript="The image shows a busy city street with cars and people walking. There are tall buildings and traffic lights. It seems to be daytime."
        )
        
        print("Speaking Evaluation Result:")
        print(json.dumps(result.details, indent=2))
    
    # Run the example
    asyncio.run(example())