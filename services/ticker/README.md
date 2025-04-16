# Ticker

[![Build project](https://github.com/CIDgravity/CIDgravity-Ticker/actions/workflows/build-project.yml/badge.svg)](https://github.com/CIDgravity/CIDgravity-Ticker/actions/workflows/build-project.yml)  [![Deploy API docs](https://github.com/CIDgravity/CIDgravity-Ticker/actions/workflows/build-docs.yml/badge.svg)](https://github.com/CIDgravity/CIDgravity-Ticker/actions/workflows/build-docs.yml)

**Ticker** is a fast and extensible Go-based API that fetches cryptocurrency ticker data from multiple exchanges and stores it in a MongoDB database.  

---

## 🌐 Supported Exchanges

- Gemini  
- Kraken  
- Crypto.com  
- CEX.io  
- FMFW  
- Bitfinex  

---

## ✨ Features

- 📡 Real-time crypto ticker retrieval  
- 🗄️ MongoDB integration for persistent storage  
- 🧩 Easily extensible architecture for new exchanges  
- 🧾 RESTful API with OpenAPI specification  
- ⚙️ Configuration using TOML files  

---

## 🧰 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/CIDgravity/ticker.git
cd ticker
```

### 2️⃣ Configure the application

Copy and customize the sample config:

```bash
cp config/config.toml.sample ./config.toml
```

### 3️⃣ Build the binary

```bash
make build
```

This will produce the `ticker` binary in the `bin` folder.

### 4️⃣ Run the application

```bash
./bin/ticker --config config.toml
```

> If you run the binary from the same directory as your config, the `--config` flag is optional.

---

## 🧪 Development Tools

| Command               | Description                                                           |
|-----------------------|-----------------------------------------------------------------------|
| `make test`           | Run unit tests                                                        |
| `make test-coverage`  | Run unit tests with coverage                                          |
| `make lint`           | Execute linters                                                       |
| `make openapi`        | Build OpenAPI documentation                                           |
| `make audit`          | Execute code quality checks                                           |
| `make tidy`           | Download dependencies                                                 |
| `make vendor`         | Download packages required to support builds and tests in the /vendor |
| `make clean`          | Clean binary and generated files                                      |
| `make build`          | Build the go application                                              |
| `make coverage`       | Displays test coverage report in html mode                            |

---

## 🔌 Adding a New Exchange

Adding support for another exchange involves three steps:

### 1. Create a new fetcher

Add a Go file in:

```
internal/exchange/new_exchange.go
```

### 2. Register the exchange

In `service/exchange_service.go` (around line 51), initialize the exchange:

```go
new_exchange.New()
```

### 3. Configure trading pair mappings

Edit:

```
config/exchange.go
```

And add the appropriate pair mappings for your new exchange.

---

## 📖 API Documentation

The API is documented with OpenAPI.

Generate it locally with:

```bash
make openapi
```

Or view the hosted version: [📘 API Docs](https://cidgravity.github.io/ticker/)

---

## 📄 License

This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for more details.

---

## 🤝 Contributions

We welcome contributions of any kind!  
Feel free to open issues, suggest features, or submit pull requests to help improve **Ticker**.