import React, { useState } from 'react';

interface CopyButtonProps {
    buttonText: string;
    getTextToCopy: () => Promise<string>;
    error?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ buttonText, getTextToCopy, error }) => {
    const [statusText, setStatusText] = useState('');
    
    const setStatusTextMiliseconds = (text: string, miliseconds: number) => {
        setStatusText(text);
        setTimeout(() => setStatusText(''), miliseconds);
    }

    const handleCopy = async () => {
        try {
            if(error) {
                setStatusTextMiliseconds(error, 2000);
                return
            }
            await navigator.clipboard.writeText(await getTextToCopy());
            setStatusTextMiliseconds('Текст успешно скопирован!', 2000);
        } catch (error) {
            console.error('Ошибка при копировании текста:', error);
            setStatusTextMiliseconds('Ошибка', 2000);
        }
    };

  return (
    <div className="flex items-center">
        <button
        type='button'
        onClick={handleCopy}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
        >
            {buttonText}
        </button>

        {/* Сообщение об успешном копировании */}
        <p className="ml-2 text-green-500">{statusText}</p>
    </div>
  );
};

export default CopyButton;
