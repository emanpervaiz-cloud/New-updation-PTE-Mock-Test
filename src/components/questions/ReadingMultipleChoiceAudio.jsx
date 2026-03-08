import React, { useEffect, useState } from 'react';
import { useExam } from '../../context/ExamContext';
import AudioPlayer from '../common/AudioPlayer';

const ReadingMultipleChoiceAudio = ({ question, onNext }) => {
    const { saveAnswer } = useExam();
    const [selectedOption, setSelectedOption] = useState(null);
    const [audioPlayed, setAudioPlayed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>
            <div style={{
                background: '#fff', padding: isMobile ? 16 : 24, borderRadius: 16, border: '1px solid #eef2f6'
            }}>
                <AudioPlayer
                    src={question.audioUrl}
                    title={isMobile ? "Listen" : "Audio Prompt"}
                    onPlay={handleAudioPlay}
                />
            </div>

            <div style={{
                background: '#fff',
                borderRadius: isMobile ? 16 : 20,
                padding: isMobile ? '20px 16px' : '32px',
                border: '1px solid #eef2f6',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)'
            }}>
                <h3 style={{ margin: 0, fontSize: isMobile ? 16 : 18, color: '#1a1f36', fontWeight: 700, lineHeight: 1.5 }}>
                    {question.question}
                </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {question.options.map((option) => {
                    const isSelected = (question.multiple && selectedOption?.includes(option.id)) ||
                        (!question.multiple && selectedOption === option.id);
                    return (
                        <div
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                padding: isMobile ? '16px' : '16px 20px',
                                background: isSelected ? 'rgba(13, 59, 102, 0.04)' : '#fff',
                                borderRadius: 12,
                                border: `1.5px solid ${isSelected ? 'var(--primary-color)' : '#eef2f6'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? '0 2px 8px rgba(13, 59, 102, 0.08)' : 'none'
                            }}
                        >
                            <div style={{
                                width: 20,
                                height: 20,
                                borderRadius: question.multiple ? 4 : '50%',
                                border: `2px solid ${isSelected ? 'var(--primary-color)' : '#cbd5e1'}`,
                                background: isSelected ? 'var(--primary-color)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {isSelected && (
                                    <div style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: question.multiple ? 1 : '50%',
                                        background: '#fff'
                                    }} />
                                )}
                            </div>
                            <div style={{
                                fontSize: isMobile ? 14 : 15,
                                color: isSelected ? '#1a1f36' : '#475569',
                                fontWeight: isSelected ? 600 : 500,
                                lineHeight: 1.5
                            }}>
                                {option.text}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{
                padding: '0 8px', fontSize: 13, color: 'var(--text-secondary)'
            }}>
                <div style={{ marginBottom: 4 }}><strong>Instructions:</strong> {question.multiple ? 'Select all that apply.' : 'Select one answer.'}</div>
                <div style={{ fontStyle: 'italic', color: '#64748b' }}>Note: Listen to the audio before answering.</div>
            </div>

            <div style={{ marginTop: 8 }}>
                <button
                    onClick={handleSubmit}
                    disabled={selectedOption === null || (question.multiple && selectedOption.length === 0)}
                    style={{
                        width: isMobile ? '100%' : 'auto',
                        padding: '14px 40px', borderRadius: 12,
                        background: (selectedOption === null || (question.multiple && selectedOption.length === 0)) ? '#e2e8f0' : 'var(--primary-color)',
                        color: '#fff', border: 'none', fontWeight: 700, fontSize: 16,
                        cursor: (selectedOption === null || (question.multiple && selectedOption.length === 0)) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(13, 59, 102, 0.15)'
                    }}
                >
                    Submit Answer
                </button>
            </div>
        </div>
    );
};

export default ReadingMultipleChoiceAudio;
