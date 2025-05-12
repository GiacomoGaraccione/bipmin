# Correzione BPMN

Ecco qua la classificazione rivista (al rialzo): 

## Errori A

- Dividere task che possono essere uniti ("fa ordine" diviso in "scegli prodotti" -> "scegli quantità", start event e poi timer anzichè start timer)
- Loop superflui (inserimento stime, composizione ordini)
- Login superfluo (magari non considerare nemmeno come errore)
- Timer inteso come passaggio di tempo anzichè come data/ora (tra 21 ore: sbagliato, sabato alle 9: corretto)

- Separare correttamente ordine online e in negozio senza però avere parte uguale condivisa (2 pool separati che ripetono molti task identici) => più in generale, non avere parti comuni unificate
- Non dare nomi a elementi che dovrebbero averlo (se ci sono diversi end event come si può distinguere quale è quale senza spiegazioni)


## Errori B

- Modifica ordine permessa al cliente, quando in realtà è calcolata dal sistema e proposta al cliente, che può accettare o rifiutare
- Gestione ordini che include sia parti del contadino (conferma quantità) che del clerk
- Eventi usati senza criterio (timer senza descrizione ma solo una nota, messaggi che non inviano/ricevono e hanno solo sequence flow)
- Messaggi usati in modo sbagliato (task/event per indicare sms/mail senza interazione con pool esterno). MA un task automatico per indicare SMS/email è accettabile.
- Task manuali completamente scollegati dal sistema (preparare i prodotti da ritirare). MA accettabile se "sostituisce" il visualizza ordini del giorno.

- gestione degli ordini (lato contadino) individuale e non cumulativa (es. pool contadino che riceve ordine): il contadino vede il totale non i singoli ordini
- errori logici di tempistiche (deadlock)


## Errori C

- Distinzione tra online e in negozio con gateway XOR
- Usare gateway per distinguere momenti temporali diversi
- Un solo pool (molto difficile modellare correttamente altrimenti): SI  specie se è pensato per un solo contadino ed un solo cliente.
- Lane system
- Messaggi tra elementi dello stesso pool
- Più start event nello stesso pool

- Portafoglio virtuale come pool esterno


## Lunedì 16/01
- Adb Rabou
- Abdullah Osman
- Agnese
- Ahmed
- Aidala
- Alcamo
- Alesso
- Almondo
- Amatiello
- Alpigiano
- Ansari
- Appino
- Arrufat
- Auda Gioanet *
- Barligea

## Martedì 17/01
- Arfe
- Barra
- Battista
- Bauchiero
- Baudino
- Beata
- Belfiore
- Bellarmino
- Bemana
- Bertolino
- Bhosale
- Bisson *
- Bizzaglia
- Blasotta
- Bocca
- Boloukifar
- Bongianino
- Bonifazi
- Borda Bossana 1
- Borda Bossana 2
- Bordino
- Borri
- Boscaro
- Botta
- Bottino
- Boudaghian
- Brunero
- Bruno
- Bruzzone
- Burato
- Busoli
- Cabrera Valentin
- Cafà
- Cagnato
- Calabrese
- Campodonico

## Mercoledì 18/01 - 108/249
- Candusso
- Caroli
- Casaletto
- Castano Garcia
- Ceccarelli
- Cecchetto
- Cesaro
- Chaverra
- Cherchi
- Chiantia
- Chirichilli
- Cipollone
- Codesal
- Cogo
- Col
- Congiu
- Coppino
- Cordon
- Correa
- Corti
- Cottura
- Crescenzi
- Crispino
- Cuesta
- D'Angelo
- De Araujo
- Dernaika
- Di Domenicantonio
- Di Fazio
- Di Ganci
- Di Stani
- Donzella
- Dragotti
- Dulcimascolo
- Eisa
- El Fateh
- Fakhri
- Falzone * SUS (Friscia)
- Fattori 
- Fenoglio
- Ferlito
- Friscia * SUS (Falzone)
- Frusci
- Gaebele
- Gaiani
- Galfione
- Gavinelli
- Ghaderidoost
- Gherra
- Giannì
- Giordano
- Giorgetti
- Glushkova
- Goegan

## Venerdì 20/01 - 188/249
- Gonzalez
- Grasso
- Grosu
- Guccione
- Hemmati
- Hussain
- Isla
- Jia
- Jubeily
- Khan
- Khizer
- Kuka
- Kumar
- Kurbanova
- Labadini
- Laudati
- Leoncini
- Leproni
- Maccini
- Majidi
- Mancini
- Manina
- Marano
- Marcenaro
- Mariggiò
- Marra
- Marsano
- Martin Munoz
- Martiny
- Maturo
- Maurici
- Mazzeo
- Meggiolaro
- Melardi 1
- Melardi 2
- Micucci
- Mischitelli
- Modica
- Mohamad
- Mohamed
- Monsefi
- Monti
- Moosavian
- Muharremi
- Murazio *
- Musco
- Mushyirahamwe
- Naderi
- Nardone
- Nikonov
- Occhi
- Oggero
- Oral
- Pacini
- Pacucci
- Pasquini
- Paul
- Perotto
- Piacentino
- Piazza
- Piccinini
- Pieraccioli
- Piletto
- Pillitteri
- Pirali
- Piraneo
- Piscicelli (molto simile a un'altra sol di venerdì)
- Polizzi
- Polvani
- Portesan
- Prato
- Pulverin
- Qin
- Quatraro
- Rahimi
- Rahimiazar
- Raja
- Rey
- Riccio
- Rollo

## Sabato 21/01
- Romano
- Rossi
- Rostagno
- Rouhparvar
- Ruberti
- Sandrone
- Sannino
- Sarpi
- Sarzano
- Scalogna
- Schubries
- Schuetze
- Scivetti
- Serpilli
- Shabani
- Singh
- Sobirov
- Soheilifar 1
- Soheilifar 2
- Soldà
- Spani
- Spina
- Spirito
- Stassi
- Strambi
- Susino
- Taglioli
- Taj Bakhsh
- Taras

## Domenica 22/01
- Tarenzi
- Tayarani
- Temirbekova
- Terzolo
- Togu
- Toppani
- Ubaydullaev
- Ubaydullaeva
- Ullasci
- Vaiano
- Vailati
- Valente * SUS (Valsana)
- Valsana * SUS (Valente)
- Van Amelsvoort
- Van Santen
- Vana
- Vanzini
- Vega
- Viceconte
- Vinci
- Vinciguerra
- Volpe
- Vottero
- Yeganeh
- You
- Younes
- Zarei
- Zhidenko
- Zudettich
- Zwart

# Correzione Mockup
razionale:

- se mancano attori una lettera in meno
- se non ci sono tutti i casi d'uso (un check almeno all'ucd in alcuni casi l'ho dovuto fare, ma si vede a occhio se manca qualcosa) -> tende a C
- se i link non funzionano e non riesco a capire cosa succede -> lettera in meno
- se hanno segnato gli step delle narrative nei titoli delle pagine e ci sono tutti i gli UC -> A senza star li troppo a guardare
- se mancano riferimenti agli UC ma comunque il giro torna -> A

## Lunedì 23/01
- Cordon
- Correa
- Corti
- Cottura
- Crescenzi
- Crispino
- D'Angelo
- De Araujo
- Dernaika
- Di Domenicantonio

## Martedì 24/01
- Di Fazio
- Di Ganci
- Di Stani
- Donzella
- Dragotti
- Dulcimascolo
- Dutto
- Eisa
- El Fateh
- Fakhri
- Falzone
- Fattori
- Fenoglio
- Ferlito
- Friscia
- Frusci
- Gaebele
- Gaiani
- Galfione
- Gavinelli
- Ghaderidoost
- Gherra
- Giannì
- Giordano
- Giorgetti
- Glushkova
- Goegan
- Gonzalez
- Grasso
- Grosu
- Guccione
- Hemmati
- Hussain
- Isla
- Jia
- Jubeily
- Khan
- Khizer
- Kuka
- Kurbanova
- Labadini
- Laudati
- Leoncini
- Leproni
- Maccini
- Majidi
- Mancini
- Manina
- Marano
- Marcenaro
- Mariggiò
- Marra
- Marsano
- Martin Munoz
- Martiny
- Maturo
- Maurici
- Mazzeo

# Setup Docker

ssh gaccio@softeng.polito.it

sudo docker ps

da li ti prendi l'hash del container

sudo docker stop hash

sudo docker pull giacomogaraccione/bipmin:client

sudo docker run -it -d --restart always -p 20000:3000 giacomogaraccione/bipmin:client

poi se vuoi entrare dentro al container fai sudo docker exec -it hash bash

e l'hash è il primo valore che vedi nella riga corrispondente alla tua immagine facendo sudo docker ps



# Interview
1. Sveglia, cula gustosa ma non troppo pesante, cafferino, studio
Studio al pc per circa 3 ore, poi altre 4 ore dopo pranzo sempre al pc
2. Si un botto
Ricordi vari, altri pensieri che portano a navigare
Telefono
Cibo
Due volte all'ora, per 5-10 minuti
Cazzo ho perso tempo devo riprendere, nè più nè meno concentrato; nessuna spinta nemmeno a riprendere subito il telefono
3. Colleghi di uni/lavoro per parlare appunto di sta roba
Telgram desktop, chiamate
Meme su altri canali ma distraggono di meno (non capita di passare un'ora a vedere reels mentre studia)
Reddit come più distraente perchè manda le notifiche, oppure facebook (c'è quasi sempre una nuova notifica, i subreddit dei vari interessi, cose nuove, distrazioni praticamente continue, se non ci fossero le notifiche molte meno distrazioni)
3 cose buone: subreddit interessanti ancxhe per il lavoro che possono far scoprire cose nuove/utili
3 cose negative: perdere tmepo, può capitare di vedere qualcosa e volerla approfondire (ulteriore perdita di tempo)
Problemi: non con reddit, può capitare di veder eun episodio in pausa pranzo e iniziare dopo 
4. niente da aggiungere

1. Studio per 4 ore di media con pausa di mezz'ora nel mezzo poi 4 ore dopo pranzo senza pausa
2. Whatsapp principalmente e poi instagram per intervalli di tipo 15 minuti tra ogni pausa (1-2)
Notare il tempo perso e poi sentirsi più attiva, più concentrata, la distrazione più lunga rilassa il cervello e aiuta (più fresca rispetto a prima)
3. Il telefono che vibra per delle cazzate innervosisce e quindi via il telefono
Insta è l'app con cui perde più tempo (storie e post), legge post di attualità news storie di vario gwenere che la appassionano
Non ci sono notifiche o cose specifiche che le fanno aprire insta, succede e basta
3 cose buone: staccare nel momento di stanchezza/poca concentrazione aiuta perchè perde tempo non sul foglio ma su qualcosa che è più interessante, ottimizzare il tempo, fornisce intrattentimento di qualità
3: starci tanto (mai due minuti di pausa, difficile fare meno di 5 minuti su instagram), sia timer giornaliero totale(2 ore) che timer da 5-10 minuti consecutivi (entrambi ignorabili per avere extra tempo) essere stoppati ma avere il tempo aumentabile non è una buona idea
Studiare roba teorica porta ad annoiarsi più facilmente e quidni è facile distrarsi ma non necessariamente con isntagram

# Risultati BIPMIN

Plan: definire tabelle (1 per metrica?) nel db, ogni diagramma valutato fa inserire una nuova riga nella tabella, alla fine di tutto il procedimento si esportano come csv e si fanno i grafici con R
`IMPORTANTE: bisogna avere già chiari i grafici o R permette di produrre roba già con i dati?`

## M1.1
- Modo per passare da elementRegistry a conto elementi di ciascun tipo definito

## M1.2
Metrica più semplice da ricavare, avendo già questi dati nei nomi dei file

## M2.1
- Decidere se regole devono essere su somiglianza a soluzione giusta o assenza di cose sbagliate
- Intero set di regole ancora da definire


## M2.2