let mediaRecorder;
let audioChunks = [];

// Record Audio
document.getElementById('recordBtn').addEventListener('click', async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.start();
  audioChunks = [];

  mediaRecorder.ondataavailable = event => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    document.getElementById('audioPlayer').src = audioUrl;
    
    // Enable encryption saving
    document.getElementById('saveEncryptedBtn').disabled = false;
    document.getElementById('saveEncryptedBtn').onclick = () => saveEncryptedAudio(audioBlob);
  };

  document.getElementById('recordBtn').disabled = true;
  document.getElementById('stopBtn').disabled = false;
});

document.getElementById('stopBtn').addEventListener('click', () => {
  mediaRecorder.stop();
  document.getElementById('recordBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
});

// Save Encrypted Audio
function saveEncryptedAudio(audioBlob) {
  const password = document.getElementById('password').value;
  
  if (!password) {
    alert("Please enter a password");
    return;
  }

  const reader = new FileReader();
  reader.onload = function() {
    const audioData = reader.result;
    
    // Send audio data to server for encryption
    fetch('/encrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioData, password })
    }).then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'encrypted_audio.aes';
        link.click();
      });
  };
  reader.readAsDataURL(audioBlob);
}

// Decrypt and Play Audio
document.getElementById('decryptBtn').addEventListener('click', () => {
  const file = document.getElementById('fileInput').files[0];
  const password = document.getElementById('decryptPassword').value;
  
  if (!file || !password) {
    alert("Please select a file and enter a password");
    return;
  }

  const reader = new FileReader();
  reader.onload = function() {
    const encryptedAudio = reader.result;
    
    // Send encrypted audio to server for decryption
    fetch('/decrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ encryptedAudio, password })
    }).then(response => response.blob())
      .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        document.getElementById('audioPlayer').src = audioUrl;
      });
  };
  reader.readAsDataURL(file);
});

