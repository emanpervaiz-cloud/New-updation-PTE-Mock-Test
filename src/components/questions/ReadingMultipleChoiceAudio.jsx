import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import AudioPlayer from '../common/AudioPlayer';

const ReadingMultipleChoiceAudio = ({ question, onNext }) => {
    const { saveAnswer } = useExam();
    const [selectedOption, setSelectedOption] = useState(null);
    const [audioPlayed, setAudioPlayed] = useState(false);

    const handleOptionSelect = (optionId) => {
        if (!question.multiple) {
            setSelectedOption(optionId);
        } else {
            if (selectedOption?.includes(optionId)) {
                setSelectedOption(selectedOption.filter(id => id !== optionId));
            } else {
                setSelectedOption([...(selectedOption || []), optionId]);
            }
        }
    };

    const handleAudioPlay = () => {
        setAudioPlayed(true);
    };

    const handleSubmit = () => {
        saveAnswer(question.id, {
            questionId: question.id,
            section: 'reading',
            type: 'multiple_choice_audio',
            response: selectedOption,
            meta: { audioPlayed: audioPlayed }
        });
        onNext();
    };

    return (
        <div className="reading-audio-question">
            <div style={{ marginBottom: 24 }}>
                <AudioPlayer
                    src={question.audioUrl}
                    title="Audio Prompt"
                    onPlay={handleAudioPlay}
                />
            </div>

            <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, color: 'var(--primary-color)', fontWeight: 600 }}>{question.question}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {question.options.map((option) => (
                    <div
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        style={{
                            padding: '16px 20px',
                            borderRadius: 12,
                            border: `2px solid ${(question.multiple && selectedOption?.includes(option.id)) ||
                                (!question.multiple && selectedOption === option.id)
                                ? 'var(--primary-color)' : '#eef2f6'
                                }`,
                            background: (question.multiple && selectedOption?.includes(option.id)) ||
                                (!question.multiple && selectedOption === option.id)
                                ? 'rgba(13, 59, 102, 0.05)' : '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            transition: 'all 0.2s'
                        }}
                    >
                        <input
                            type={question.multiple ? 'checkbox' : 'radio'}
                            checked={
                                (question.multiple && selectedOption?.includes(option.id)) ||
                                (!question.multiple && selectedOption === option.id)
                            }
                            onChange={() => { }}
                            style={{ cursor: 'pointer' }}
                        />
                        <div style={{ fontSize: 15, color: '#3e4e68', fontWeight: 500 }}>
                            {option.text}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 24, padding: '16px', background: '#f8f9fe', borderRadius: 12 }}>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
                    <strong>Instructions:</strong> {question.multiple ? 'Select all that apply.' : 'Select one answer.'}
                    <br />Note: Listen to the audio before answering.
                </p>
            </div>

            <div style={{ marginTop: 32 }}>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={selectedOption === null || (question.multiple && selectedOption.length === 0)}
                    style={{
                        padding: '12px 32px',
                        borderRadius: 12,
                        background: 'var(--primary-color)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: (selectedOption === null || (question.multiple && selectedOption.length === 0)) ? 'not-allowed' : 'pointer',
                        opacity: (selectedOption === null || (question.multiple && selectedOption.length === 0)) ? 0.6 : 1,
                        boxShadow: '0 4px 12px rgba(13, 59, 102, 0.2)'
                    }}
                >
                    Submit Answer
                </button>
            </div>
        </div>
    );
};

export default ReadingMultipleChoiceAudio;
