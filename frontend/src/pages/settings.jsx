import React, { useState, useEffect } from 'react'

const Settings = () => {
  const [selectedSound, setSelectedSound] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null);
  const soundOptions = [
    { name: 'Siren 1', src: '/assets/siren-1.mp3' },
    { name: 'Siren 2', src: '/assets/siren-2.mp3' },
    { name: 'Siren 3', src: '/assets/siren-3.mp3' }
  ];

  const handleSoundSelection = (sound) => {
    if (audioInstance) {
      audioInstance.pause();
      setAudioInstance(null);
    }

    setSelectedSound(sound);
  };

  const playSound = () => {
    if (selectedSound) {
      const audio = new Audio(selectedSound.src);
      audio.play();
      setAudioInstance(audio);
    }
  };

  const pauseSound = () => {
    if (audioInstance) {
      audioInstance.pause();
    }
  };

  const resumeSound = () => {
    if (audioInstance) {
      audioInstance.play();
    }
  };

  const stopSound = () => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
    }
  };

  const saveSelectedSound = () => {
    if (selectedSound) {
      localStorage.setItem('selectedSound', selectedSound.name);
    }
  };

  useEffect(() => {
    const savedSound = localStorage.getItem('selectedSound');

    if (savedSound) {
      const sound = soundOptions.find(option => option.name === savedSound);
      if (sound) setSelectedSound(sound);
    }
  }, []);

  return (
    <div className="p-6 max-w-[640px] m-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-lg mb-4">Choose an alert sound to play when an animal is detected:</p>
      <div className="flex flex-col gap-4">
        {soundOptions.map((sound, index) => (
          <button
            key={index}
            onClick={() => handleSoundSelection(sound)}
            className={`p-2 border ${selectedSound?.name === sound.name ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {sound.name}
          </button>
        ))}
      </div>
      <div className="mt-6 flex gap-4">
        <button
          onClick={playSound}
          disabled={!selectedSound}
          className="p-3 bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300"
        >
          Play
        </button>
        <button
          onClick={pauseSound}
          disabled={!audioInstance}
          className="p-3 bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300"
        >
          Pause
        </button>
        <button
          onClick={resumeSound}
          disabled={!audioInstance}
          className="p-3 bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300"
        >
          Resume
        </button>
        <button
          onClick={stopSound}
          disabled={!audioInstance}
          className="p-3 bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300"
        >
          Stop
        </button>
        <button
          onClick={saveSelectedSound}
          disabled={!selectedSound}
          className="p-3 bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300"
        >
          Save Selection
        </button>
      </div>
    </div>
  )
}

export default Settings