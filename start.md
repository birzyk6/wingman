# Wingman start project

# 0. Docker

Odpalamy pierwszy terminal

Jeżeli odpalaliście już wcześniej `docker-compose up -d`, to wystarczy teraz tylko

```shell
docker-compose start
```

Jak chcecie wyłączyć kontenery, to

```shell
docker-compose stop
```

Jak chcecie usunąć kontenery:

```shell
docker-compose down
```

# 1. Odpalanie Backendu (Django)

Odpalcie sobie drugi terminal \
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

Jak nie zadziała to musicie wcześniej mieć terminal odpalony w dobrym środowisku, czyli wpisujecie

```shell
venv\Scripts\activate
```

### Mac / Linux

```shell
source venv/bin/activate
```

# 2. Odpalanie frontendu (NextJS)

Odpalamy trzeci terminal

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
