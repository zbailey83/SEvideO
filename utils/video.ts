
export const extractFramesFromVideo = (
  videoFile: File,
  framesToExtract: number = 10
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];

    if (!ctx) {
      return reject('Could not create canvas context');
    }

    video.preload = 'auto';
    video.src = URL.createObjectURL(videoFile);
    
    video.addEventListener('loadeddata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const duration = video.duration;
      const interval = duration / framesToExtract;
      let currentTime = 0;
      let framesExtracted = 0;

      const captureFrame = () => {
        if (framesExtracted >= framesToExtract) {
          URL.revokeObjectURL(video.src);
          resolve(frames);
          return;
        }

        video.currentTime = currentTime;
      };

      video.addEventListener('seeked', () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Get frame as base64 data URL (JPEG format for smaller size)
        const frameDataUrl = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
        frames.push(frameDataUrl);
        framesExtracted++;
        currentTime += interval;
        
        if (currentTime <= duration) {
          captureFrame();
        } else {
           URL.revokeObjectURL(video.src);
           resolve(frames);
        }
      });
      
      captureFrame();
    });

    video.addEventListener('error', (e) => {
        URL.revokeObjectURL(video.src);
        reject(`Error loading video: ${e.message}`);
    });
  });
};
