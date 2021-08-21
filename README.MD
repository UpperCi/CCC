# PRG04 HERKANSING eindopdracht 

Wanneer je volledige eindcijfer (klassendiagram + afgeronde eindopdracht) een onvoldoende is kan je het hele project herkansen. 

- [Kies een nieuwe startopdracht met uniek thema en game mechanic in de gaminator](https://hr-cmgt.github.io/gaminator/) 
- Bedenk hiermee een nieuw game concept. 
- Maak een **nieuw klassendiagram**. 
- **Bouw je nieuwe game** in Object Oriented Typescript.
- Vul dit inleverdocument helemaal in

## Deadline: 23 augustus

**De deadline voor het inleveren van de game is Maandag 23 augustus om 10:00 (week 0).**

⚠️ Je werk wordt **beoordeeld volgens de cursushandleiding**. Lees dit nog even goed door voordat je je project inlevert.

---

<br>
<br>
<Br>

# Klassendiagram
![UML](docs/assets/readme/CCCUML.png)

Plaats je klassendiagram als PNG bestand. Dat kan je doen met een image tag:

```javascript
<img src="mijnklassendiagram.png">
```
## Classes en verantwoordelijkheden

### Game
`Game` regelt een aantal algemene zaken.
`Game` heeft de `loop`-functie, dit is dé functie die alles laat updaten. In de `loop`-functie worden de `draw`-functies van alle `CanvasObjects` aangeroepen, de `TouchManager` wordt ge-update en delta wordt berekend.<br><br>
`Game` heeft een referentie naar alle `CanvasObjects` die op de canvas getekend moeten worden. Op volgorde van `zIndex` (laag naar hoog) worden deze tijdens het loopen allemaal geupdate. Het is een 2D array, op de 10e plek zit een array met alle objecten die een `zIndex` hebben van 10.<br><br>
In `updateDisplaySize` wordt de grootte van het canvas afgesteld op de grootte van het scherm. Deze neemt met `getBoundingClientRect()` de grootte van de pagina, haalt hier (indien niet in fullscreen) de margins van af en berekent vervolgens hoe hoog en breed de canvas kan zijn. Wordt aangeroepen elke keer dat de window wordt ge-resized.<br><br>
`fsButton` is een `Button` die regelt dat je fullscreen in- en uit kan schakelen. Of je in fullscreen zit wordt in `fullscreen` bijgehouden, op die manier kan ik ervoor zorgen dat de margins rondom het canvas verdwijnen wanneer je fullscreen inschakelt.<br><br>
`Game` heeft een aantal `create...`-functies. Deze dienen als een soort wrapper voor het aanmaken van bepaalde classes en haalt de objecten meteen door `addObj()` waardoor de objecten die je aanroept ook meteen gerendered worden. Zo kun je in één keer `createImage(args...)` doen in plaats van 
```ts
let img = new Image(args...);
game.addObj(img);
```
Je kan elk object weer verwijderen met behulp van `removeObj(obj)`.
De `start`-functie start de gehele game en het speelveld op.

### TouchManager
`TouchManager` regelt input van zowel de muis als van een touchscreen, doordat allebei dezelfde output geven hoef ik op andere plekken geen aparte code voor muis en touch te schrijven.


## Encapsulation

Toelichting encapsulation

## Composition

Toelichting composition

## Inheritance

Toelichting inheritance

<br>
<br>
<Br>

# Game

Mijn nieuwe thema uit de [gaminator](https://hr-cmgt.github.io/gaminator/) is:_______________

Toelichting gameplay:

## Classes

Toelichting classes

## Encapsulation

Toelichting encapsulation

## Composition

Toelichting composition

## Inheritance

Toelichting inheritance

## Game development technieken

Beschrijving game development technieken