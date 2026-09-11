# train_model.py
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense

# โหลดข้อมูล
data = pd.read_json('data.json')

questions = data['question'].values
answers = data['answer'].values

tokenizer = Tokenizer()
tokenizer.fit_on_texts(questions + answers)
vocab_size = len(tokenizer.word_index) + 1

# แปลงข้อมูลเป็นลำดับ
sequences = tokenizer.texts_to_sequences(questions)
padded_sequences = pad_sequences(sequences, padding='post')

sequences_answers = tokenizer.texts_to_sequences(answers)
padded_sequences_answers = pad_sequences(sequences_answers, padding='post')

# แบ่งข้อมูลเป็นชุดฝึกและทดสอบ
X_train, X_test, y_train, y_test = train_test_split(padded_sequences, padded_sequences_answers, test_size=0.2, random_state=42)

# สร้างโมเดล
model = Sequential()
model.add(Embedding(vocab_size, 64, input_length=padded_sequences.shape[1]))
model.add(LSTM(64, return_sequences=True))
model.add(LSTM(64))
model.add(Dense(vocab_size, activation='softmax'))

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# ฝึกโมเดล
model.fit(X_train, y_train, epochs=10, validation_data=(X_test, y_test))

# บันทึกโมเดล
model.save('chat_model.h5')
