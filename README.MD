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
`Game` heeft een aantal `create___`-functies. Deze dienen als een soort wrapper voor het aanmaken van bepaalde classes en haalt de objecten meteen door `addObj()` waardoor de objecten die je aanroept ook meteen gerendered worden. Zo kun je in één keer `createImage(args...)` doen in plaats van 
```ts
let img = new Image(args...);
addObj(img);
```
Je kan elk object weer verwijderen met behulp van `removeObj(obj)`.<br><br>
De `start`-functie start de gehele game en het speelveld op.

### TouchManager
`TouchManager` regelt input van zowel de muis als van een touchscreen, doordat allebei dezelfde output geven hoef ik op andere plekken geen aparte code voor muis en touch te schrijven.<br><br>
`downTouch` slaat de event op die is meegegeven mij een 'mouseDown' of 'touchDown' event. Zo kan ik ophalen op welke positie de klik/tik begonnen is.<br><br>
`just`- `Tapped`, `Moved` en `Down` houden bij of er in de laatste frame een klik/tik is losgelaten, bewogen of neergekomen.<br><br>
`last`- `Tap` en `Move` houden de positie van de laatste tik en beweging bij.<br><br>
`offset` en `resMult` worden gebruikt om de positie in pixels op het originele 160px × 320px canvas te berekenen van een klik/tik. `offset` houdt de linkerbovenhoek van de canvas bij en `resMult` hoe groot de canvas is t.o.v. 160px × 320px.<br><br>
`onTouch`- `Down`, `Up`, `Move` nemen de event-objecten die worden gegenereerd bij interactie via de muis/touchscreen en updaten op basis hiervan de input-data zoals of er afgelopen frame is getikt en waar er voor het laatst is bewogen. De `event`-varianten van deze functies werken als een wrapper voor specifiek het touchscreen, deze vergelijken de id van de events met `trackId` om ervoor te zorgen dat er maar één vinger tegelijk bij wordt gehouden. Indien de id's overeenkomen wordt het event direct doorgevoerd naar de corresponderende methods.<br><br>
`fakeTouchEvent` neem een `MouseEvent` en zet deze om tot een `Touch`-mockup, deze kan ik dan invoeren in de `onTouch`-functies.<br><br>
`initListeners` koppelt de muis- en touchEvents aan de corresponderende methods.<br><br>
`update` reset de `just`-variabelen en moet dus elke frame aangeroepen worden.<br><br>
De `touchDown`-getter geeft aan of op dit moment de muis wordt ingedrukt/er een vinger op het scherm drukt.

### Vector
`Vector` is een class om coordinaten bij te houden en ermee te rekenen. Heeft een `x`- en `y`-waarde (getallen) en kan hier een aantal functies op uitvoeren. <br><br>
Met `add` en `subtract` kun je bij de `Vector` een andere `Vector` optellen/ aftrekken.<br><br>
Met `multiply` en `divide` kun je de `Vector` vermenigvuldigen met/ delen door een andere `Vector` óf een getal! Bij een `Vector` is het `v1.x * v2.x; v1.y * v2.y` en bij een getal wordt op de X en de Y hetzelfde getal toegepast.<br><br>
Let Op! Bij alle functies hierboven wordt het resultaat niet toegepast op de `Vector` waarop je de functie uitvoert maar wordt er een nieuwe `Vector` teruggegeven met het resultaat.<br><br>
`normalize` geeft een `Vector` die dezelfde 'richting' op gaat maar een lengte heeft van 1.<br><br>
Shoutout naar Pythagoras want dankzij hem heb ik een `length`-getter kunnen implementeren die de lengte van de `Vector` teruggeeft.

### CanvasObject
Een interface die door alle objecten die moeten worden gerendered, b.v. `CanvasImage` en `CanvasText`, wordt geïmplementeerd.<br><br>
`visible` spreekt een beetje voor zich, staat dit op false dan zou het object niet moeten worden getekend.<br><br>
`zIndex` werkt zoals de z-index in b.v. CSS, hogere waarden worden getekent over de lagere waarden heen.<br><br>
`draw` is een algemene method die dus niet wordt gedefiniëerd. De objecten die `CanvasObject` implementeren definiëren deze funtie elk op hun eigen manier om aan te geven hoe het getekend moet worden. Als je de functie op een `CanvasImage` aanroept tekent het een afbeelding en als je het op een `CanvasText` aanroept tekent het wat tekst, het feit dat dit bij alle objecten dezelfde naam en parameters heeft maakt het makkelijk om in `Game` één stuk code te schrijven die alle objecten kan tekenen. Neemt een `Game` en een `CanvasRenderContext2D` als parameters, dit is waar 'game' en 'ctx' naar verwijzen in de toelichting van alle implementaties van dit interface.

### CanvasImage
Implementatie van `CanvasObject`. Tekent de een afbeelding, `img`, op een bepaalde plek op de canvas, `position`.<br><br>
In `draw` wordt `ctx.drawImage` aangeroepen met de `img`- en `position`-attributen als argumenten:
```ts
ctx.drawImage(this.img, this.position.x, this.position.y);
```

### CanvasAnimatedImage
Extensie van `CanvasImage`. Kan een animaties tekenen op basis van een (horizontale) spritesheet.<br><br>
`frameWidth` geeft de breedte aan van individuele frames. Op basis hiervan wordt ook het totaal aantal frames in de afbeeldinge, `frames`, berekend.<br><br>
`frameTime` geeft aan hoevel milliseconden lang elke frame is, soort 'omgekeerde' fps.<br><br>
In `draw` wordt het aantal ms sinds de vorige frame opgeteld bij `fpsTimer`. Indien `frameTime` hierdoor wordt overschreden wordt er één opgeteld bij `currentFrame`. Indien `currentFrame` hoger is dan `frames` wordt er geloopt of wordt het hele object verwijderd van de game, ligt eraan of `selfDestruct` op true of false staat.<br><br>
Als de huidige frame eenmaal bepaald is wordt er berekend welk deel van de afbeelding getekend moet worden. Vervolgens wordt dat deel dus getekend:
```ts
let clipPos = this.currentFrame * this.frameWidth;
if (this.visible) {
    ctx.drawImage(this.img, clipPos, 0, this.frameWidth, this.img.height,
    this.position.x, this.position.y, this.frameWidth, this.img.height);
}
```

### Healthbar
Extensie van `CanvasImage`. Bepaalt op zichzelf welke afbeelding er wordt getekend (healthbarOver.png), en tekent enkel een deel van deze afbeelding.<br><br>
`hp` geeft huidige hp van de vijand aan, `maxHealth` het maximum. `clip` is het percentage dat de vijand van z'n `maxHealth` over heeft vermenigvuldigd met de breedte van de afbeelding.<br><br>
`updateHealth` haalt een getal van `hp` af en herberekent wat `clip` moet zijn.<br><br>\
`draw` tekent de eerste [`clip`] rijen pixels van de afbeelding:
```ts
let h = this.img.height;
ctx.drawImage(this.img, 0, 0, this.clip, h, this.position.x, this.position.y, Math.ceil(this.clip), h);
```

### Button
Extensie van `CanvasImage`. Naast het tekenen van een afbeelding functioneert het ook als knop.<br><br>
`size` wordt in combinatie met `position` van `CanvasImage` gebruik om in `posIn` te bepalen of een `Vector` zich binnen de randen van de knop bevindt. Als je als `Vector` de positie van de muis meegeeft (zoals in `draw` en `checkHover` wordt gedaan), kun je kijken of je met de muis op de knop rust.<br><br>
In `draw` wordt `checkHover` uitgevoerd met de muis-coordinaten als input (uit de game-parameter gehaald). Als hieruit blijkt dat je muis boven de knop zit kan de afbeelding worden verandert van het bestand in `bgSrc` naar het bestand in `hoverSrc`. Er wordt ook gekeken of er afgelopen frame getikt is, indien dit het geval is én de muis zich boven de knop bevindt wordt de callback-functie `effect` uitgevoerd:
```ts
super.draw(ctx, game);
if (game.touch.justMoved) {
    this.checkHover(game.touch.lastMove);
    if (this.hover) {
        game.canvas.style.cursor = 'pointer';
    } else {
        game.canvas.style.cursor = 'default';
    }
}
if (game.touch.justTapped && this.posIn(game.touch.lastTap)) {
    this.effect();
}
```

### CanvasText
Implementatie van `CanvasObject`. Tekent de tekst `text` op de positie `position`.<br><br>
`align` en `font` hebben invloed op de opmaak van de tekst. `fill` geeft de kleur van de letters aan.<br><br>
In `draw` worden een aantal functies opgeroepen om de tekst te tekenen:
```ts
ctx.font = this.font;
ctx.textAlign = this.align;
ctx.fillStyle = this.fill;
ctx.fillText(this.text, this.position.x, this.position.y);
```

### GameBoard
Veruit de grootste class. Handelt zegmaar alle echte game-logica af als items genereren, input verwerken en score bijhouden.<br><br>
Het allereerste wat `GameBoard` is `generateBoard` oproepen. Ter voorbereiding wordt aan het begin van deze functie `initItemPool` opgeroepen. In hetzelfde bestand staat een constant die de data van alle items bevat. `Itemtypes` geeft aan welk van deze items er ge-initialiseerd moeten worden. Er wordt door deze items geïtereerd en op basis van de data worden dingen als de sprite, itemType (`Rune`, `Ingredient`, `Spell`) en punten bepaald. Voor elk van deze bundels data wordt een class gegenereerd en toegevoegd aan `itemPool`.<br><br>
Na dat worden `recipe`, `hpBar`, `barBG` en `scoreText` gedefiniëerd. Dit zijn allemaal visuele elementen, de meeste spreken voor zich. `recipe` is gewoon een instantie van de class `Recipe`.<br><br>
Als dat allemaal uit de weg is doet `generateBoard` eindelijk wat het belooft. `size` geeft aan hoeveel rijen en kolommen het veld-raster heeft, dit op basis hiervan worden een aantal willekeurige item gegenereerd om het veld mee op te vullen. Deze worden gepusht naar de `items` array. Alles wordt op een manier gegenereerd dat het veld niet begint met al matchende vakjes. `highlight` wordt gedefiniëerd, dit is een afbeelding die m.b.v. `updateHighlight` een specifiek vakje in het raster kan... highlighten. (gewoon transparant wit vierkant)<br><br>
`inBounds` neemt een `Vector` en kijkt of deze zich binnen de randen van het speelveld bevindt zodat ik niet per ongeluk probeer een niet-bestaande cel op te roepen. Returnt gwn true of false.<br><br>
`posToCell` neemt een `Vector` die een pixel op de canvas aanwijst en geeft terug een `Vector` met de X en Y coords van de corresponderende cel. Meestal gebruik ik een getal om een cel aan te geven maar hier koos ik voor een `Vector` zodat ik een paar dingen iets korter kon schrijven.<br><br>
`cellToPos` neemt een getal die een cel aangeeft en geeft een `Vector` terug die de pixel aanwijst van waar de linkerbovenhoek van deze cel zich bevindt. Handig als ik iets op een bepaalde cel wil tekenen.<br><br>
`clear` neemt een cel en markeert dat deze moet exploderen. Gaat meestal gecombineerd met `score` die een cel neemt en de `value` hiervan optelt bij de `points` van de speler. (wordt dus ook meteen van de hp van de hpBar afgehaald)<br><br>
Om alles wat overzichtelijker te maken heb ik van deze class een state machine gemaakt. In de update functie wordt `state` geëvalueerd met een switch-case statement. Er zijn 5 states:
#### GAMEPLAY
GAMEPLAY is de 'standaard' state. Deze wacht op input van de speler en reageert wanneer het dit krijgt.<br><br>
`hoverUpdate` zorgt ervoor dat de positie van `highlight` de cel reflecteert waar de muis zich boven bevindt.<br><br>
`itemGrabUpdate` kijkt elke frame of er op een een cel wordt getikt. Zo ja, dan wordt de cel in `trackedItem` opgeslagen en het object in die cel in `trackedItemRef`.<br><br>
`itemReleaseUpdate` kijkt wanneer je een item loslaat. Als je dit op een aangrenzende cel doet worden de objecten in deze cel en degene die je vast hebt gepakt omgewisseld. M.b.v. `animItem` wordt er een simpele animatie voor beide items ingesteld en vervolgens veranderd `state` naar WAIT.
#### WAIT
WAIT doet wat het zegt, niks...<br><br><br> Elke frame wordt `waitTimer` afgeteld en wanneer dit onder de 0 komt veranderd de state naar ANIMATION. Hoe lang er moet worden gewacht wordt bepaald door `waitTimer` een waarde te geven (voordat je `state` aanpast).
#### ANIMATION
ANIMATION speelt animaties af. Een animatie is niet meer dan dat de afbeelding van een item van positie A naar positie B wordt bewogen, zo kan ik b.v. items laten 'vallen' in plaats van dat ze direct op hun nieuwe plek terechtkomen. `animTimer` geeft aan hoe lang deze staat actief moet zijn. Hier wordt elke frame het aantal seconden sinds de laatste frame van af gehaald en wanneer dit onder de 0 terechtkomt veranderd `state` naar BOARDUPDATE.<br><br>
`animUpdate` gaat langs alle items, indien er bij een item gemarkeerd staat dat het een animatie moet afspelen wordt de item bewogen richting zijn einddoel. Het beginpunt, einddoel en de snelheid worden in de `Item` class zelf bepaald.
#### BOARDUPDATE
BOARDUPDATE evalueert het boord.<br><br>
`updateItems` zorgt ervoor dat als animaties niet zijn afgerond dat de items alsnog op de juiste plek worden getekend. Voor het geval een animatie net verkeerd getimed is.<br><br>
`clearItems` gaat langs alle items en indien er reeksen zijn van 3+ keer dezelfde `Rune` wordt deze gecleared. Hierbij worden ook meteen animaties ingesteld, punten geupdate en gecheckt of zich in de aangrenzende cellen `Ingredienten` bevinden. Aangrenzende ingredienten worden ook gecleared en toegevoegd aan `inventory`. Als er items zijn gecleared verandert de state in ANIMATION, anders wordt het GAMEPLAY<br><br>
`updateSpellbook` gaat langs alle spells waar je toegang tot hebt en vergelijkt ze met je inventory om te kijken of je ze al kan gebruiken.<br><br>
`checkHP` kijkt of de `hp` van de balk onder 0 zit, zo ja dan verandert de state in STOP en ontstaat er een retry-`button` om de game te resetten.
#### STOP
STOP doet verrassend genoeg **nog minder dan WAIT!** Het telt niet eens af. Als `state` op STOP wordt gezet moet het van buitenaf weer in iets anders veranderd worden, anders blijft het boord tot het eind der tijden op pauze staan.

### Item
Item is een basis-class voor de objecten in alle cellen van het speelveld.<br><br>
`src` wordt gerbuikt voor `image` en tekent dus de afbeelding van het corresponderende item.<br><br>
`type` geeft aan wat voor type item het is, `matchable` geeft aan met welke typen het kan matchen. Ik was van plan om misschien iets te doen met `Items` die met meerdere typen konden matchen maar ben hier niet aan toegekomen, dus `matchable` is altijd een array met als enige waarde hetzelfde als bij `type`.<br><br>
`weight` geeft de kans aan dat dit item genereert.<br><br>
`targetCell`, `animSpeed` en `moving` worden gebruikt om het `Item` te animeren zoals beschreven bij Game -> ANIMATION. `moving` geeft aan óf dit `Item` aan het bewegen is; `targetCell` en `animSpeed` bepalen waarheen en hoe snel.

### Rune
`Rune` heeft geen extra waarden. Het heeft een constructor die het aantal code íets inkort maar heb er vooral een aparte class van gemaakt voor overzichtelijkheid.

### Ingredient
Extensie van `item`. Heeft als enige extra attribuut een string die de naam aangeeft. Dit is basically een ID en had dus misschien beter een enum kunnen zijn maar ik had er een string van gemaakt voor debugging en er zit nu net wat te veel code aan vast om het nog ff te veranderen en daarnaast maakt het niet heel veel uit dus ja. 👽

### Spell
`Spells` hebben één functie: `use`. Dit is een callback-functie die wordt uitgevoerd als je de `Spell` activeert. Spells hebben als `image` een `CanvasAnimatedImage`. Deze wordt in de constructor helemaal geregeld en omdat het een extensie is van `CanvasImage` botst dit nergens met andere code.

### BookSpell
Is dit een coole variant op `Spell`? Nee! Dit is de knop waar je op drukt om een `Spell` te genereren.<br><br>
`sprite` wordt gebruikt om het icoontje van de `Spell` te tekenen. `disableSprite` is een zwarte transparante overlay voor wanneer je je dit niet kan verooloven.<br><br>
`spell` is gwn een referentie naar de `Spell` die deze `BookSpell` reflecteerd.<br><br>
`btn` is de `button` zelf, wordt achter de `sprite` getekend.<br><br>
`affordable` vergelijkt de `game`'s `inventory` met de `cost` om te kijken of je je dit al kan veroorloven.<br><br>
`updateLook` kijkt naar affordable zet op basis hiervan de `visibility` van `disableSprite` op true of false.<br><br>
`genItem` neemt een willekeurige cel op het speelveld en verandert de inhoudt in een #diepe kopie van `spell`.

### Recipe
Als je op een `BookSpell` klikt en de `cost` van deze niet `affordable` is dan wordt `dit object` getoond met een overzicht van de `Ingredienten` die je nodig hebt om aan de `cost` van de `BookSpell` te voldoen. `De `game` wordt hiervoor op WAIT. M.b.v. een kruisje, `btn` kun je vervolgens terugkeren naar het spel`.

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

Mijn nieuwe thema uit de [gaminator](https://hr-cmgt.github.io/gaminator/) is: Fantasy! Bewitch! Robots!

Toelichting gameplay:
Met behulp van 'heksachtige' (Bewitch) ingrediënten (pompoenen, vleermuisvleugels) maak je spreuken (Fantasy) om robots (Robots) te verslaan. Fantasy en bewitching gaan een beetje hand in hand.
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