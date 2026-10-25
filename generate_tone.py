import math, struct, wave

sample_rate = 22050
duration = 3
frequency = 440
amplitude = 32767

num_samples = sample_rate * duration

samples = []


for i in range(num_samples):
    sample = math.sin((math.pi * 2 * frequency * i/sample_rate))
    integer_sample = int(sample * amplitude)

    samples.append(struct.pack('<h', integer_sample))

wav_file = wave.open("audio/test-tone.wav", "wb")
wav_file.setnchannels(1)
wav_file.setsampwidth(2)
wav_file.setframerate(sample_rate)

wav_file.writeframes(b''.join(samples))

wav_file.close()