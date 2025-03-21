# Wingman initial setup

### Struktura

Cały projekt podzielony jest na sekcję

1. Docker - postgres i llama
2. Backend - django (Python)
3. Frontend - NextJS (TypeScript, React)

Podzielony jest on na foldery **backend** i **frontend**

# 0. Docker

Odpalcie te dwa kontenery na dockerze co robiliśmy, wejdźcie w **Docker Desktop**, potem w lewym pasku **Containers** i tam macie taki przycisk **_play_** no i wciśnijcie, żeby odpalił wam się każdy kontener.

# 1. Backend

## 1. Zainstalowanie venv python'a

### Tworzenie repo

```shell
git clone git@github.com:birzyk6/wingman.git
```

Super, mamy teraz sklonowane repo, ale jeszcze trzeba zrobić pare rzeczy żeby je odpalić

Najpierw backend ;3

## 2. Backend

```shell
cd wingman # Wchodzimy do folderu
cd backend # Do folderu backend
```

### Windows

```shell
python -m venv venv # Tworzymy środowisko
venv\Scripts\activate
```

### Mac / Linux

```shell
python -m venv venv
source venv/bin/activate
```

## 3. Instalowanie bilbiotek

```shell
pip install django djangorestframework django-cors-headers psycopg2-binary requests
```

## Migracje

Co to są migracje?? a no takie, że jeśli zmienimy strukturę naszego backendu, tj. Modele, Tabele, Dane itd. itp. to żeby nasza baza ogarnęła.

```shell
python manage.py migrate
```

## Odpalanie serwera Django

```shell
# Odpali serwer na którym bedzie stało django, domyślnie: localhost:8000
python manage.py runserver
```

Jeśli wszystko dobrze zrobimy powinniśmy dostać coś takiego:

```shell
python manage.py runserver
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
March 21, 2025 - 21:08:31
Django version 5.1.7, using settings 'backend.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

# Frontend

## 1. Pobieranie NodeJS

Jeżeli ktoś nie ma jeszcze zainstalowanego node'a, to musimy zacząć od tego

https://nodejs.org/en

Pobrać, Node'a zainstalować no i zajebiście możemy odpalać rzeczy z JavaScripta.

**Jak już zinstalujemy sobie Node'a to sprawdzamy czy wszystko git**

```shell
node --version
```

Powinniście zobaczyć coś takiego

```shell
> v20.18.0
```

## 2. Instalowanie bilbiotek

Okej super, teraz zrobimy dymy, czyli wchodzimy w folder **frontend**

```shell
cd frontend
```

```shell
# Instalowanie bibliotek
# W naszym pliku package.json są zapisane biblioteki których używamy, jeśli odpalimy npm install to pobiorą nam sie nowe potrzebne do projektu, chyba że mamy je już zainstalowane

npm install
```

```shell
# Odpala nam serwer do fronta
# Domyślnie localhost:3000

npm run dev
```
