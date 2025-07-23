'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Predefined avatar options
const avatars = [
  { id: 'avatar1', src: '/avatars/avatar1.svg', alt: 'Cartoon Character 1' },
  { id: 'avatar2', src: '/avatars/avatar2.svg', alt: 'Cartoon Character 2' },
  { id: 'avatar3', src: '/avatars/avatar3.svg', alt: 'Cartoon Character 3' },
  { id: 'avatar4', src: '/avatars/avatar4.svg', alt: 'Cartoon Character 4' },
  { id: 'avatar5', src: '/avatars/avatar5.svg', alt: 'Cartoon Character 5' },
  { id: 'avatar6', src: '/avatars/avatar6.svg', alt: 'Cartoon Character 6' },
];

export default function AvatarPage() {
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            toast.error('Please log in first');
            setTimeout(() => {
                router.push('/');
            }, 1500);
            return;
        }
        
        // Load previously selected avatar if any
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
            setSelectedAvatar(savedAvatar);
        }
    }, [router]);

    function handleSaveAvatar() {
        if (!selectedAvatar) return;
        
        // Save avatar selection to localStorage
        localStorage.setItem('userAvatar', selectedAvatar);
        
        // Dispatch event to update UI elsewhere
        window.dispatchEvent(new CustomEvent('avatarUpdate', { 
            detail: { avatarId: selectedAvatar } 
        }));
        
        toast.success('Avatar updated successfully');
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold mb-6 text-gray-800">Choose Your Avatar</h1>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {avatars.map(avatar => (
                        <div 
                            key={avatar.id}
                            className={`cursor-pointer p-2 rounded-lg ${selectedAvatar === avatar.id ? 'bg-green-100 ring-2 ring-green-500' : 'hover:bg-gray-100'}`}
                            onClick={() => setSelectedAvatar(avatar.id)}
                        >
                            <img 
                                src={avatar.src} 
                                alt={avatar.alt}
                                className="w-full h-auto rounded-lg" 
                            />
                        </div>
                    ))}
                </div>
                
                <Button 
                    onClick={handleSaveAvatar}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={!selectedAvatar}
                >
                    Save Avatar
                </Button>
            </div>
        </div>
    );
}