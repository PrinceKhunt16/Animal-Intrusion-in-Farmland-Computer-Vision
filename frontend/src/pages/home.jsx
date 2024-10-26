import React, { useState, useRef, useEffect } from 'react';

const Home = () => {
  const [mode, setMode] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const imageCanvasRef = useRef(null);
  const videoCanvasRef = useRef(null);
  const webcamCanvasRef = useRef(null);
  const webcamRef = useRef(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const soundOptions = [
    { name: 'Siren 1', src: '/assets/siren-1.mp3' },
    { name: 'Siren 2', src: '/assets/siren-2.mp3' },
    { name: 'Siren 3', src: '/assets/siren-3.mp3' }
  ];

  const handleMode = (mode) => {
    setImage(null);
    setVideo(null);
    setDetectionResults(null);
    stopWebcam();
    setMode(mode);
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleVideoChange = (event) => {
    setVideo(event.target.files[0]);
  };

  const handleImageSubmit = async () => {
    const canvas = imageCanvasRef.current;

    if (!canvas) {
      console.error('Canvas error');
      return;
    }

    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = URL.createObjectURL(image);

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      await detectAndDraw(canvas, context);
    };
  };

  const handleVideoSubmit = async () => {
    const videoElement = document.createElement('video');
    videoElement.src = URL.createObjectURL(video);
    videoElement.play();
    videoElement.onloadeddata = () => {
      const canvas = videoCanvasRef.current;

      if (!canvas) {
        console.error('Canvas error');
        return;
      }

      const context = canvas.getContext('2d');
      const captureInterval = 10000;
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      const captureFrames = setInterval(async () => {
        if (videoElement.ended) {
          clearInterval(captureFrames);
          return;
        }

        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        await detectAndDraw(canvas, context);
      }, captureInterval);
    };
  };

  const startWebcam = async () => {
    setIsWebcamActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      webcamRef.current.srcObject = stream;
      webcamRef.current.play();
    } catch (error) {
      console.error("Error webcam:", error);
    }
  };

  const stopWebcam = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const stream = webcamRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      setIsWebcamActive(false);
    }
  };

  const detectAndDraw = async (canvas, context) => {
    const formData = new FormData();
    const dataUrl = canvas.toDataURL('image/jpeg');
    const blob = await (await fetch(dataUrl)).blob();
    formData.append('file', blob);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setDetectionResults(data);

      if (data.message) {
        const savedSoundName = localStorage.getItem('selectedSound') || 'Siren 1';
        const selectedSound = soundOptions.find(sound => sound.name === savedSoundName);

        if (selectedSound) {
          const audio = new Audio(selectedSound.src);
          audio.play();
        }
      }

      if (data.boxes) {
        data.boxes.forEach(box => {
          const [x1, y1, x2, y2] = box;
          context.strokeStyle = 'red';
          context.lineWidth = 5;
          context.strokeRect(x1, y1, x2 - x1, y2 - y1);
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const detectionResult = (results) => {
    if (!results || !results.detected) return null;
    return Object.entries(results.detected).map(([animal]) => (
      <p key={animal}>{`${animal} detected`}</p>
    ));
  };

  useEffect(() => {
    const processWebcamFrames = () => {
      if (!isWebcamActive || !webcamCanvasRef.current || !webcamRef.current) return;

      const canvas = webcamCanvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = 640;
      canvas.height = 480;

      const captureFrame = async () => {
        if (!isWebcamActive) return;

        context.drawImage(webcamRef.current, 0, 0, canvas.width, canvas.height);
        await detectAndDraw(canvas, context);
        setTimeout(captureFrame, 10000);
      };

      captureFrame();
    };

    if (isWebcamActive) {
      processWebcamFrames();
    }

    return () => stopWebcam();
  }, [isWebcamActive]);

  return (
    <div className='p-6 max-w-[640px] m-auto'>
      <h1 className='text-2xl font-bold mb-4'>Upload Image or Video, Webcam</h1>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => handleMode('image')}
          className={`p-4 ${mode === 'image' ? 'bg-gray-500 text-white' : 'bg-gray-300'} hover:bg-gray-600 hover:text-white`}
        >
          Image
        </button>
        <button
          onClick={() => handleMode('video')}
          className={`p-4 ${mode === 'video' ? 'bg-gray-500 text-white' : 'bg-gray-300'} hover:bg-gray-600 hover:text-white`}
        >
          Video
        </button>
        <button
          onClick={() => handleMode('webcam')}
          className={`p-4 ${mode === 'webcam' ? 'bg-gray-500 text-white' : 'bg-gray-300'} hover:bg-gray-600 hover:text-white`}
        >
          Webcam
        </button>
      </div>
      <div className='mb-4'>
        {mode === 'image' && (
          <>
            <div>
              <label
                htmlFor="image-file-upload"
                className="border p-[15px] w-full cursor-pointer inline-block hover:bg-gray-600 hover:text-white mb-4"
              >
                Choose File
              </label>
              <input
                id="image-file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {image && (
              <div>
                <img
                  src={URL.createObjectURL(image)}
                  alt="Image Preview"
                  className="w-full max-w-full h-auto"
                />
                <button
                  onClick={() => handleImageSubmit(image)}
                  className="mt-4 p-4 bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300"
                  disabled={!image}
                >
                  Upload and Analyze
                </button>
                {detectionResults && (
                  <>
                    {
                      detectionResults.message === 1 && (
                        <div className="my-4">
                          <h2 className="text-xl font-bold">Detection Results:</h2>
                          {detectionResult(detectionResults)}
                        </div>
                      )
                    }
                    {detectionResults.message === 0 && (
                      <div className="my-4">
                        <h2 className="text-xl font-bold">Detection Results:</h2>
                        <p>No Detection</p>
                      </div>
                    )}
                  </>
                )}
                <canvas ref={imageCanvasRef} className="w-full max-w-full mt-4"></canvas>
              </div>
            )}
          </>
        )}
      </div>
      <div className='mb-4'>
        {mode === 'video' && (
          <>
            <div>
              <label
                htmlFor="image-file-upload"
                className="border p-[15px] w-full cursor-pointer inline-block hover:bg-gray-600 hover:text-white mb-4"
              >
                Choose File
              </label>
              <input
                id="image-file-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
            </div>
            {video && (
              <div>
                <video
                  src={URL.createObjectURL(video)}
                  controls
                  className="mt-2 w-full max-w-full h-auto"
                >
                </video>
                <button
                  onClick={() => handleVideoSubmit(video)}
                  className="mt-4 p-4 bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300"
                  disabled={!video}
                >
                  Upload and Analyze
                </button>
                {detectionResults && (
                  <>
                    {
                      detectionResults.message === 1 && (
                        <div className="my-4">
                          <h2 className="text-xl font-bold">Detection Results:</h2>
                          {detectionResult(detectionResults)}
                        </div>
                      )
                    }
                    {detectionResults.message === 0 && (
                      <div className="my-4">
                        <h2 className="text-xl font-bold">Detection Results:</h2>
                        <p>No Detection</p>
                      </div>
                    )}
                  </>
                )}
                <canvas ref={videoCanvasRef} className="w-full max-w-full mt-4"></canvas>
              </div>
            )}
          </>
        )}
      </div>
      <div className='mb-4'>
        {mode === 'webcam' && (
          <>
            <div className='flex gap-4'>
              <button
                onClick={startWebcam}
                className="p-4 bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300"
              >
                Start Webcam
              </button>
              <button
                onClick={stopWebcam}
                className="p-4 bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300"
                disabled={!isWebcamActive}
              >
                Stop Webcam
              </button>
            </div>
            {isWebcamActive && (
              <div>
                <video ref={webcamRef} className="mt-4 w-full max-w-full h-auto" autoPlay />
                {detectionResults && (
                  <>
                    {detectionResults.message === 1 && (
                      <div className="my-4">
                        <h2 className="text-xl font-bold">Detection Results:</h2>
                        {detectionResult(detectionResults)}
                      </div>
                    )}
                    {detectionResults.message === 0 && (
                      <div className="my-4">
                        <h2 className="text-xl font-bold">Detection Results:</h2>
                        <p>No Detection</p>
                      </div>
                    )}
                  </>
                )}
                <canvas ref={webcamCanvasRef} className="w-full max-w-full mt-4"></canvas>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;