"""Original, locally synthesized exam theme; no third-party samples."""
from pathlib import Path
import subprocess
import tempfile
import wave
import numpy as np

RATE = 22050
BEAT = 60 / 96
BARS = 16
LENGTH = BEAT * 4 * BARS
audio = np.zeros((round(RATE * LENGTH), 2), dtype=np.float64)

def note(midi, start, duration, volume, voice='pluck', pan=0):
    t = np.arange(round(duration * RATE)) / RATE
    hz = 440 * 2 ** ((midi - 69) / 12)
    if voice == 'pad':
        wavelet = np.sin(2*np.pi*hz*t) + .18*np.sin(2*np.pi*hz*2*t)
        envelope = np.sin(np.pi*np.arange(len(t))/len(t)) ** 2
    else:
        wavelet = np.sin(2*np.pi*hz*t) + .25*np.sin(2*np.pi*hz*2*t) + .08*np.sin(2*np.pi*hz*3*t)
        envelope = (1-np.exp(-t/0.012)) * np.exp(-t/(duration*.26))
        envelope *= np.minimum(1,(duration-t)/.04)
    sample = wavelet * envelope * volume
    indices = (round(start*RATE)+np.arange(len(t))) % len(audio)
    for channel, gain in enumerate((np.sqrt((1-pan)/2),np.sqrt((1+pan)/2))):
        np.add.at(audio[:,channel],indices,sample*gain)

# D minor – B-flat – G minor – A minor; a quiet pulse with an original melody.
chords = [(50,57,62,65),(46,53,58,62),(43,50,55,58),(45,52,57,60)]
melodies = [(74,77,76,72,74,69,72,76), (77,74,72,69,70,74,77,76)]
for bar in range(BARS):
    root,fifth,third,top = chords[bar % 4]
    at = bar * 4 * BEAT
    for pitch in (third,top,fifth+12):
        note(pitch,at,4*BEAT,.026,'pad',.1)
    for beat in range(4):
        note(root,at+beat*BEAT,BEAT*.75,.095,'pluck',-.25)
    arp = [third,fifth+12,top,fifth+12]
    for eighth in range(8):
        note(arp[eighth%4],at+eighth*BEAT/2,BEAT*.7,.037,'pluck',.35)
    if bar % 4 >= 2:
        melody = melodies[(bar//4)%2]
        for eighth,pitch in enumerate(melody):
            note(pitch,at+eighth*BEAT/2,BEAT*.85,.032,'pluck',-.1)

audio = .67 * audio / max(np.max(np.abs(audio)),.01)
pcm = (audio * 32767).astype('<i2')
out = Path(__file__).resolve().parent / 'assets/bgm_exam.mp3'
with tempfile.TemporaryDirectory() as temp:
    wav = Path(temp)/'exam.wav'
    with wave.open(str(wav),'wb') as stream:
        stream.setnchannels(2);stream.setsampwidth(2);stream.setframerate(RATE)
        stream.writeframes(pcm.tobytes())
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(wav),'-codec:a','libmp3lame','-b:a','96k',str(out)],check=True)
print(out, out.stat().st_size, 'bytes', LENGTH, 'seconds')
