"""Train a character-level encoder/decoder on local question/answer pairs.

This experimental model is separate from the application's Ollama endpoint.
"""
import argparse
import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, RepeatVector


def train(data_path, output_dir, epochs=10):
    tf.keras.utils.set_random_seed(42)
    records = json.loads(Path(data_path).read_text(encoding="utf-8-sig"))
    if len(records) < 2 or any(
        not isinstance(row.get(key), str) or not row[key].strip()
        for row in records for key in ("question", "answer")
    ):
        raise ValueError("Provide at least two non-empty question/answer pairs")

    train_rows, test_rows = train_test_split(records, test_size=0.2, random_state=42)
    # Character tokens support Thai without relying on whitespace segmentation.
    tokenizer = Tokenizer(char_level=True, lower=False, filters="", oov_token="<UNK>")
    tokenizer.fit_on_texts(
        [row["question"] for row in train_rows] + [row["answer"] for row in train_rows]
    )
    question_length = max(len(row["question"]) for row in train_rows)
    answer_length = max(len(row["answer"]) for row in train_rows)
    vocab_size = len(tokenizer.word_index) + 1

    def encode(rows, key, length):
        return pad_sequences(tokenizer.texts_to_sequences([row[key] for row in rows]),
                             maxlen=length, padding="post", truncating="post")

    x_train = encode(train_rows, "question", question_length)
    y_train = encode(train_rows, "answer", answer_length)
    x_test = encode(test_rows, "question", question_length)
    y_test = encode(test_rows, "answer", answer_length)
    model = Sequential([
        tf.keras.Input(shape=(question_length,)),
        Embedding(vocab_size, 64, mask_zero=True),
        LSTM(64),
        RepeatVector(answer_length),
        LSTM(64, return_sequences=True),
        Dense(vocab_size, activation="softmax"),
    ])
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy",
                  weighted_metrics=["accuracy"])
    model.fit(x_train, y_train, epochs=epochs,
              sample_weight=(y_train != 0).astype(np.float32),
              validation_data=(x_test, y_test, (y_test != 0).astype(np.float32)))
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    model.save(output_dir / "chat_model.keras")
    (output_dir / "tokenizer.json").write_text(tokenizer.to_json(), encoding="utf-8")
    (output_dir / "config.json").write_text(json.dumps({
        "question_length": question_length, "answer_length": answer_length,
        "vocab_size": vocab_size,
    }), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=Path(__file__).with_name("data.json"))
    parser.add_argument("--output", type=Path, default=Path(__file__).with_name("model"))
    parser.add_argument("--epochs", type=int, default=10)
    args = parser.parse_args()
    train(args.data, args.output, args.epochs)
