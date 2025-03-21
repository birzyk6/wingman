# Wingman start project

# 0. Docker

Odpalcie te dwa kontenery na dockerze co robiliśmy, wejdźcie w **Docker Desktop**, potem w lewym pasku **Containers** i tam macie taki przycisk **_play_** no i wciśnijcie, żeby odpalił wam się każdy kontener.

# 1. Odpalanie Backendu (Django)

Odpalcie sobie nowy terminal \
nazwijcie go **django** (opcjonalne)

### Wchodzimy do folderu backend

```shell
cd wingman
cd backend
```

### Tworzenie migracji

Migracje odpalamy, jeśli zmienialiście coś w backendzie w modelach, bazie danych itp. itd.

```shell
python manage.py migrate
```

---

<span style="color:red">**Jak coś pójdzie nie tak! to wtedy to niżej**</span>

```shell
python manage.py makemigrations
python manage.py migrate
```

---

### Odpalanie serwera

```shell
python manage.py runserver
```

# 2. Odpalanie frontendu (NextJS)

```shell
cd frontend
```

```shell
npm run dev
```

---

Jeśli ktoś dodawał jakieś biblioteki do frontu itp. to wtedy `npm run dev` nam nie zadziała, więc trzeba odpalić

```shell
npm install
```

A następnie

```shell
npm run dev
```
