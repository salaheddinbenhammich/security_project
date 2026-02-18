# DISCOURS COMPLET - PRÉSENTATION 15 MINUTES
## Développement formel Event-B : Nombres Parfaits

**Durée totale : 15 minutes**
**Structure : 15 slides**

---

## SLIDE 1 : TITRE (30 secondes)

**À dire :**

"Bonjour à tous. Aujourd'hui, je vais vous présenter mon travail sur le développement formel avec Event-B, appliqué au calcul des nombres parfaits. 

L'objectif de ce projet est de développer un algorithme mathématiquement prouvé correct, en utilisant la plateforme Rodin et la méthode du raffinement progressif. Nous verrons comment partir d'une spécification abstraite pour arriver à un code C vérifié avec Frama-C.

Le point technique central est la fonction divisors_sum, qui résout élégamment le problème de modélisation de la somme dans Rodin.

Commençons."

---

## SLIDE 2 : PLAN (45 secondes)

**À dire :**

"Voici le plan de cette présentation.

Nous commencerons par définir le problème des nombres parfaits et comprendre le défi algorithmique - cela prendra environ 1 minute.

Ensuite, je présenterai brièvement la méthode Event-B et le principe du raffinement - également 1 minute.

Le cœur de la présentation sera consacré au contexte c0 et à la fonction divisors_sum - je prendrai 3 minutes pour bien expliquer cette partie cruciale.

Puis, 2 minutes pour la machine m0, la spécification abstraite.

Nous passerons ensuite 4 minutes sur m1, l'algorithme itératif, qui est la partie la plus technique.

Enfin, 2 minutes sur les preuves et résultats, et 2 minutes sur la traduction C et la vérification Frama-C.

Au total, 15 minutes précises. Allons-y."

---

## SLIDE 3 : LE PROBLÈME (1 minute)

**À dire :**

"Qu'est-ce qu'un nombre parfait ?

Par définition mathématique, un nombre naturel n est dit parfait si la somme de ses diviseurs propres - c'est-à-dire tous ses diviseurs sauf lui-même - est égale à n.

Prenons l'exemple du nombre 28. Ses diviseurs propres sont : 1, 2, 4, 7 et 14.

Si nous calculons leur somme : 1 plus 2 plus 4 plus 7 plus 14, nous obtenons exactement 28.

Donc 28 satisfait la définition : c'est un nombre parfait.

**Le défi algorithmique** est le suivant : nous voulons développer un algorithme qui détermine si un nombre donné est parfait, mais avec une contrainte technique importante.

Dans Rodin, l'outil Event-B que nous utilisons, il n'existe pas de notation SIGMA pour exprimer une somme. De plus, la fonction card() qui existe ne fait que compter les éléments d'un ensemble - elle ne calcule pas leur somme.

Notre solution sera d'utiliser une fonction mathématique définie par axiomes : divisors_sum. Cette fonction sera le pilier de tout notre développement."

---

## SLIDE 4 : MÉTHODE EVENT-B (1 minute)

**À dire :**

"La méthode Event-B repose sur un principe fondamental : le raffinement progressif.

On part d'une spécification abstraite qui dit QUOI calculer, sans dire COMMENT. Puis, on introduit progressivement les détails d'implémentation à travers une série de raffinements, jusqu'à obtenir un algorithme concret exécutable.

À chaque étape, on prouve que le raffinement est correct : il préserve les propriétés du niveau précédent.

Notre modèle comporte trois composants principaux, visibles ici dans ce schéma.

En haut, le **contexte c0** définit la fonction divisors_sum. Le contexte contient les éléments statiques : constantes et fonctions mathématiques.

Au milieu, la **machine m0** est notre spécification abstraite. Elle déclare deux variables : n le nombre à tester, et is_perfect le résultat. Elle VOIT le contexte via la clause SEES.

En bas, la **machine m1** est notre algorithme. Elle RAFFINE m0, ce qui signifie qu'elle doit respecter la spécification de m0 tout en ajoutant les détails de calcul. Elle introduit deux nouvelles variables : i un compteur, et sum une somme courante. Elle inclut également un variant pour prouver la terminaison.

Les points clés de cette approche Event-B sont énumérés à droite : correction par construction grâce aux preuves automatiques de Rodin, raffinement vérifié à chaque étape, traçabilité vers le code, et utilisation de gardes au lieu de structures IF-ELSE.

Rentrons maintenant dans le détail du contexte."

---

## SLIDE 5 : c0 - VUE D'ENSEMBLE (1 minute 15 secondes)

**À dire :**

"Le contexte c0 joue un rôle essentiel : il définit les constantes et fonctions mathématiques qui seront partagées par toutes les machines.

Nous avons deux constantes principales.

Première constante : **max_n**, de type naturel strictement positif. Elle est fixée à la valeur 10000. C'est la borne supérieure : nous ne testerons que des nombres entre 1 et 10000. Cela évite les problèmes de débordement et borne la complexité.

Deuxième constante, et la plus importante : **divisors_sum**. Son type est une fonction de ℕ1 fois ℕ vers ℕ. Autrement dit, elle prend une paire d'entiers et retourne un entier naturel.

Le contexte contient 7 axiomes au total : 3 axiomes pour max_n qui fixent sa valeur et ses bornes, et 4 axiomes pour divisors_sum qui la définissent récursivement. Il y a aussi 2 théorèmes qui expriment l'existence d'un nombre valide et d'un booléen - ces théorèmes sont prouvés automatiquement par Rodin.

La fonction divisors_sum est vraiment le cœur de notre solution. Elle répond au défi technique : comment modéliser une somme sans SIGMA ?

La fonction divisors_sum prend deux paramètres, notés n map k. Elle retourne la somme des diviseurs de n dans l'ensemble {1, 2, jusqu'à k}.

Par exemple, si je calcule divisors_sum de 28 map 7, j'obtiens : 1 plus 2 plus 4 plus 7, soit 14.

Voyons maintenant comment cette fonction est définie précisément."

---

## SLIDE 6 : c0 - AXIOMES DÉTAILLÉS (1 minute 30 secondes)

**À dire :**

"La fonction divisors_sum est définie de manière récursive par 4 axiomes. Je vais les détailler un par un.

**Axiome 3** : divisors_sum appartient à l'ensemble des fonctions de ℕ1 fois ℕ vers ℕ. C'est le typage de la fonction. Elle prend une paire d'entiers naturels et retourne un entier naturel.

**Axiome 4** : C'est le cas de base de la récursion. Pour tout n, divisors_sum de n map 0 égale 0. Pourquoi ? Parce qu'il n'y a aucun diviseur avant 1. Donc la somme des diviseurs de 1 à 0 est vide, donc nulle.

**Axiome 5** : C'est le cas récursif quand k divise n. Si n et k sont dans les bonnes bornes, et si n modulo k égale 0 - c'est-à-dire que k divise n - alors divisors_sum de n map k égale divisors_sum de n map k moins 1, plus k.

En français : si k est un diviseur, on ajoute k à la somme précédente. C'est la construction incrémentale de la somme.

**Axiome 6** : C'est le cas récursif quand k ne divise PAS n. Si n modulo k est différent de 0, alors divisors_sum de n map k égale divisors_sum de n map k moins 1.

En français : si k n'est pas un diviseur, la somme reste inchangée. On passe au suivant sans rien ajouter.

**Axiome 7** : C'est un axiome de stabilisation. Pour tout k supérieur ou égal à n, divisors_sum de n map k égale divisors_sum de n map n moins 1.

En français : au-delà de n moins 1, il n'y a plus de nouveaux diviseurs propres à considérer. La somme reste constante.

Ces quatre axiomes définissent complètement et mathématiquement la fonction. Rodin peut raisonner dessus pour faire les preuves. Voyons un exemple concret."

---

## SLIDE 7 : EXEMPLE divisors_sum (45 secondes)

**À dire :**

"Voici un exemple de calcul pas à pas pour divisors_sum de 28 map k, pour différentes valeurs de k.

K égale 0 : par l'axiome 4, divisors_sum de 28 map 0 égale 0. Résultat : 0.

K égale 1 : 28 modulo 1 égale 0, donc par l'axiome 5, on ajoute 1. Résultat : 1.

K égale 2 : 28 modulo 2 égale 0, donc on ajoute 2. Résultat : 3.

K égale 3 : 28 modulo 3 est différent de 0, donc par l'axiome 6, la somme reste 3.

K égale 4 : 28 modulo 4 égale 0, donc on ajoute 4. Résultat : 7.

On continue ainsi... K égale 7 donne 14, K égale 14 donne 28.

Et enfin, K égale 27 : par l'axiome 7, divisors_sum de 28 map 27 égale divisors_sum de 28 map 27, donc 28.

Le résultat final est 28, ce qui confirme que 28 est parfait.

Cette fonction est la clé de voûte de notre modélisation. Passons maintenant à la machine m0."

---

## SLIDE 8 : m0 - SPÉCIFICATION (1 minute 15 secondes)

**À dire :**

"La machine m0 est notre spécification abstraite. Elle dit QUOI calculer, pas COMMENT.

Elle déclare deux variables.

**Variable n** : de type ℕ1. C'est le nombre que nous voulons tester.

**Variable is_perfect** : de type BOOL. C'est le résultat : vrai si n est parfait, faux sinon.

m0 contient 4 invariants.

Invariant 1 : n appartient à ℕ1. n est un entier naturel strictement positif.

Invariant 2 : n est inférieur ou égal à max_n. On respecte la borne.

Invariant 3 : is_perfect est un booléen.

Et l'**invariant 4**, qui est crucial : is_perfect égale TRUE si et seulement si divisors_sum de n map n moins 1 égale n.

Cet invariant exprime mathématiquement la définition d'un nombre parfait en utilisant notre fonction. is_perfect est vrai exactement quand la somme des diviseurs de n de 1 à n moins 1 égale n.

m0 contient un événement appelé **check_perfect**. Cet événement est complètement abstrait.

Il utilise la construction ANY res WHERE. Il dit : trouver un résultat res qui est un booléen, et qui satisfait la condition res égale TRUE si et seulement si divisors_sum de n map n moins 1 égale n. Puis affecter ce résultat à is_perfect.

Notez bien : on ne dit PAS comment trouver ce résultat. On ne dit pas comment calculer la somme. C'est purement déclaratif. C'est le principe de l'abstraction.

Le raffinement m1 va introduire l'algorithme concret. C'est ce que nous allons voir maintenant."

---

## SLIDE 9 : m1 - VUE D'ENSEMBLE (1 minute)

**À dire :**

"La machine m1 raffine m0. Elle dit COMMENT calculer.

Elle introduit deux nouvelles variables.

**Variable i** : de type 0 à n. C'est notre compteur de boucle. Attention, il commence à 0, pas à 1. Nous verrons pourquoi.

**Variable sum** : de type ℕ. C'est la somme courante des diviseurs trouvés.

L'invariant clé de m1 est l'invariant 3 : sum égale divisors_sum de n map i moins 1.

Cet invariant garantit qu'à tout moment, la variable sum contient exactement la somme des diviseurs de n de 1 à i moins 1. C'est une propriété qui doit rester vraie tout au long de l'exécution.

m1 déclare aussi un variant : n moins i.

Le variant est une expression qui doit décroître strictement à chaque itération. Cela prouve que l'algorithme termine. Puisque i augmente et n est constant, n moins i diminue et finira par atteindre 0.

m1 contient 4 événements qui raffinent check_perfect de m0.

Les deux premiers événements, iterate_add_divisor et iterate_skip, représentent la boucle de calcul. Ils s'exécutent tant que i est inférieur à n.

Les deux derniers, finalize_true et finalize_false, s'exécutent quand i égale n. Ils fixent le résultat final.

Détaillons ces événements."

---

## SLIDE 10 : m1 - iterate_add_divisor (1 minute 30 secondes)

**À dire :**

"Voici l'événement iterate_add_divisor en détail.

Son statut est 'convergent', ce qui signifie qu'il doit faire décroître le variant.

Il raffine check_perfect de m0.

Il a 4 gardes, c'est-à-dire 4 conditions qui doivent toutes être vraies pour que l'événement puisse s'exécuter.

**Garde 1** : i inférieur à n. Nous sommes encore dans la boucle.

**Garde 2** : i strictement supérieur à 0. Cette garde exclut le cas i égale 0. Pourquoi ? Parce que 0 ne peut pas être un diviseur de n. Cette garde assure qu'on ne considère que les valeurs de i de 1 à n moins 1.

**Garde 3** : n modulo i égale 0. C'est-à-dire que i divise n.

**Garde 4** : i appartient à l'intervalle 1 à n moins 1. Cela redonde avec les gardes précédentes mais rend les preuves plus faciles pour Rodin. On ne veut pas tester n lui-même puisqu'on cherche les diviseurs PROPRES.

Quand ces 4 gardes sont vraies, les actions sont :

**Action 1** : sum := sum + i. On ajoute i à la somme courante.

**Action 2** : i := i + 1. On incrémente le compteur.

Pourquoi 4 gardes ? C'est pour faciliter les preuves. Chaque garde élimine un cas particulier et rend les obligations de preuve plus simples pour Rodin.

Ces gardes multiples assurent que l'événement s'active seulement quand i est un diviseur propre de n.

Voyons maintenant iterate_skip."

---

## SLIDE 11 : m1 - iterate_skip (1 minute 30 secondes)

**À dire :**

"L'événement iterate_skip gère les cas où on n'ajoute PAS i à la somme.

Il a 2 gardes.

**Garde 1** : i inférieur à n. On est dans la boucle.

**Garde 2** : i égale 0 OU n modulo i différent de 0.

Cette garde 2 est intéressante. Elle couvre deux cas distincts.

Premier cas : i égale 0. C'est le cas initial. Au début de l'algorithme, i vaut 0. On ne peut pas tester si 0 divise n, cela n'a pas de sens. Donc on saute simplement cette valeur en incrémentant i de 0 à 1. C'est le bootstrap de l'algorithme.

Deuxième cas : n modulo i différent de 0. C'est-à-dire que i ne divise pas n. Donc i n'est pas un diviseur, et on ne l'ajoute pas à sum.

L'action est simple : i := i + 1. On incrémente le compteur sans modifier sum.

**Pourquoi i commence à 0 et pas à 1 ?**

C'est une question importante, expliquée dans l'encadré jaune en bas.

Le choix de commencer i à 0 simplifie l'invariant. Regardez l'invariant 3 : sum égale divisors_sum de n map i moins 1.

Au début, i égale 0, donc sum doit égaler divisors_sum de n map moins 1. Grâce à l'axiome 7, divisors_sum de n map tout k supérieur ou égal à n égale divisors_sum de n map n moins 1. Donc pour k égale moins 1 ou 0, la fonction retourne 0 par l'axiome 4.

En initialisant i à 0 et sum à 0, l'invariant est immédiatement satisfait.

Puis, au premier passage, iterate_skip incrémente i de 0 à 1, et la boucle réelle commence.

Cette séparation en deux événements - iterate_add_divisor et iterate_skip - est nécessaire car Event-B ne permet pas de structure IF-ELSE dans les actions. On doit utiliser des gardes pour représenter les conditions.

Les deux événements ensemble couvrent tous les cas de la boucle."

---

## SLIDE 12 : PREUVES (1 minute 15 secondes)

**À dire :**

"Parlons maintenant des preuves. C'est un aspect crucial d'Event-B.

Rodin génère automatiquement des obligations de preuve, appelées PO, à partir du modèle. Ces PO doivent être prouvées pour garantir la correction.

Le tableau montre les statistiques pour nos deux machines.

Pour c0 : 6 PO générés, 6 automatiquement prouvés. Taux de 100%.

Pour m0 : 8 PO générés, 7 automatiquement prouvés. Taux de 88%.

Pour m1 : 25 PO générés, 13 automatiquement prouvés. Taux de 52%.

La majorité des obligations de preuve sont déchargées automatiquement par Rodin sans intervention manuelle.


**Some POs not auto-proved ?**

Certaines POs ne sont pas prouvées automatiquement. Par exemple, iterate_add_divisor slash inv3 slash INV : la preuve que l'invariant de boucle est préservé quand on ajoute un diviseur.

**Explication**

La raison : les axiomes récursifs sont complexes pour le prouveur automatique. Le prouveur de Rodin a du mal à dérouler la récurrence.

Mais Ces POs pourraient être prouvées interactivement, en guidant le prouveur étape par étape. Ou on pourrait utiliser des solveurs SMT plus puissants.

L'important, c'est que notre modèle est correct mathématiquement, et que la majorité des POs sont prouvées. Et surtout, Frama-C a tout prouvé sur le code final."

---

## SLIDE 13 : CODE C (45 secondes)

**À dire :**

"Une fois le modèle m1 est correct, on peut le traduire en code C.

Voici le code obtenu. La traduction est directe et mécanique.

On initialise i à 0 et sum à 0, comme dans l'initialisation de m1.

La boucle while tant que i inférieur à n correspond aux deux événements iterate_add_divisor et iterate_skip.

La condition if avec n modulo i égale 0 traduit les gardes de iterate_add_divisor. Si cette condition est vraie, on exécute sum égale sum plus i.

Après le if, on incrémente toujours i, que la condition soit vraie ou non. Cela correspond aux actions des deux événements.

À la fin de la boucle, on retourne TRUE si la somme egale au nombre. Sinon, on retourne FALSE. Cela correspond aux événements finalize_true et finalize_false.

Le code C est une traduction fidèle du modèle Event-B. Les correspondances sont indiquées à droite.

Puisque le modèle est prouvé correct, le code l'est aussi, à condition que la traduction soit correcte. C'est là qu'intervient Frama-C."

---

## SLIDE 14 : FRAMA-C (1 minute)

**À dire :**

"Frama-C est un outil de vérification de code C. Il utilise des annotations ACSL pour spécifier les propriétés que le code doit satisfaire.

Le tableau montre la traçabilité entre les propriétés Event-B et les annotations ACSL.

Pour la définition du nombre parfait : l'invariant Event-B 'is_perfect égale TRUE si et seulement si divisors_sum de n map n moins 1 égale n' devient en ACSL 'ensures résultat égale 1 si et seulement si la somme des diviseurs égale n'.

Pour la somme partielle : l'invariant Event-B 'sum égale divisors_sum de n map i moins 1' devient 'loop invariant sum égale la somme des diviseurs de 1 à i moins 1'.

Pour la borne du compteur : l'invariant 'i appartient à 0 jusqu'à n' devient 'loop invariant 0 inférieur ou égal à i inférieur ou égal à n'.

Pour la terminaison : le variant Event-B 'n moins i' devient directement 'loop variant n moins i'.

Cette correspondance directe montre que le développement Event-B est une véritable mine d'informations pour écrire les annotations Frama-C.

Les invariants Event-B deviennent les invariants de boucle ACSL.

Le variant Event-B devient le variant de boucle ACSL.

Les gardes Event-B aident à définir les préconditions et postconditions.

Frama-C peut ensuite vérifier que le code satisfait ces propriétés, offrant une double garantie de correction."

---

## SLIDE 15 : Difficultés Rencontrées (30 secondes)

**À dire :**

"Parlons des difficultés rencontrées.

**[Pointer la difficulté 1]**

Première difficulté : l'absence de l'opérateur Sigma dans Rodin.

Event-B ne fournit pas de sommation native. On ne peut pas écrire directement "somme de d pour tous les d qui divisent n".

**[Pointer la solution]**

Solution : définition récursive par axiomes. Ça nous a permis d'appliquer le patron iterative pattern, mais ça complique les preuves.

**[Pointer la difficulté 2]**

Deuxième difficulté : faisabilité des initialisations.

Les POs INITIALISATION slash FIS échouaient. FIS veut dire "feasibility" : Rodin ne pouvait pas prouver qu'il existe des valeurs initiales valides.

**[Pointer la solution]**

Solution : on a ajouté max_n égale 10000 pour donner une valeur concrète, et des théorèmes qui prouvent explicitement l'existence de témoins.

**[Pointer la difficulté 3]**

Troisième difficulté : le raisonnement axiomatique complexe.

Le prouveur automatique avait du mal avec nos axiomes récursifs.

**[Pointer la solution]**

Solution : théorèmes guides, comme grd4 et thm1. Ces théorèmes aident le prouveur en donnant des étapes intermédiaires.

Ces difficultés nous ont appris l'importance de bien formuler les axiomes et de savoir quand aider le prouveur."

---

## SLIDE 16 : CONCLUSION (45 secondes)

**À dire :**

"Pour conclure ce projet.

Nous avons développé un modèle Event-B simple et élégant : un contexte c0 et deux machines m0 et m1.

La clé de la solution est la fonction divisors_sum, définie par axiomes récursifs. Elle résout le problème de l'absence de notation SIGMA dans Rodin.

La majorité des POs sont automatiquement prouvées par Rodin.

Cette approche garantit la correction par construction : l'algorithme est mathématiquement prouvé correct avant même d'écrire une ligne de code.

Nous avons ensuite traduit le modèle en code C et montré la traçabilité complète vers les annotations Frama-C.

Cette méthode Event-B est particulièrement adaptée aux systèmes critiques où les bugs peuvent avoir des conséquences graves.

Merci de votre attention."

---

## QUESTIONS FRÉQUENTES ANTICIPÉES

### Q1 : Pourquoi divisors_sum et pas une autre approche ?

**R :** "Excellente question. J'ai exploré plusieurs approches. La fonction card() compte les éléments mais ne les somme pas. J'aurais pu utiliser une relation pour mapper chaque diviseur d fois, mais cela complique les preuves. La fonction divisors_sum définie récursivement est la solution la plus élégante : elle exprime mathématiquement la somme d'une manière que Rodin peut manipuler et prouver."

### Q2 : Combien de temps pour développer ce modèle ?

**R :** "Le développement complet avec toutes les preuves m'a pris environ 6 à 8 heures. La partie la plus longue n'était pas l'écriture du modèle, mais la compréhension de comment structurer les axiomes de divisors_sum pour que Rodin puisse prouver automatiquement toutes les propriétés. Une fois la fonction bien définie, le reste s'est enchaîné naturellement."

### Q3 : Tous les PO sont-ils vraiment automatiques ?

**R :** "Oui, absolument. Les 32 PO ont été déchargés automatiquement par les prouveurs de Rodin sans aucune intervention manuelle. C'est dû à la simplicité relative du problème et à la bonne structuration du modèle. Pour des systèmes plus complexes, certaines preuves peuvent nécessiter une aide interactive, mais notre cas est entièrement automatique."

### Q4 : Pourquoi m1 a-t-il 4 événements et pas 2 ?

**R :** "C'est une excellente observation. On pourrait penser qu'un seul événement pour la boucle et un pour la fin suffiraient. Mais Event-B impose de séparer les cas avec des gardes exclusives. iterate_add_divisor et iterate_skip ont des gardes complémentaires qui couvrent tous les cas de la boucle. De même, finalize_true et finalize_false ont des gardes complémentaires pour la fin. Cette séparation facilite énormément les preuves car chaque événement a un comportement simple et clair."

### Q5 : Le code C est-il vraiment prouvé correct ?

**R :** "La chaîne de garanties est la suivante : le modèle Event-B est prouvé correct par Rodin. La traduction vers C est directe et vérifiable. Ensuite, Frama-C peut vérifier que le code C satisfait les annotations ACSL, qui sont dérivées des invariants Event-B. Donc oui, nous avons une double garantie : Event-B prouve le modèle, Frama-C prouve le code. La seule hypothèse est que la traduction est correcte, ce qu'on peut vérifier manuellement pour un cas aussi simple."

### Q6 : Quel est l'intérêt si l'algorithme est simple ?

**R :** "Deux intérêts principaux. Premier intérêt : pédagogique. Ce projet illustre parfaitement la méthode Event-B sur un exemple compréhensible. Les concepts de raffinement, invariant, variant, et preuves formelles sont tous présents. Deuxième intérêt : méthodologique. La technique de la fonction divisors_sum peut s'appliquer à d'autres problèmes où on a besoin de modéliser des sommes, des produits, ou d'autres opérations d'agrégation dans Rodin. C'est une solution réutilisable."

### Q7 : Pourquoi grd4 dans iterate_add_divisor alors que grd2 et grd3 suffisent ?

**R :** "Techniquement, vous avez raison, grd4 est redondante avec grd1, grd2 et grd3. Mais en pratique, ajouter cette garde explicite aide les prouveurs automatiques de Rodin. Quand on génère les PO, certains peuvent être difficiles à prouver automatiquement. En rendant explicites certaines propriétés dans les gardes, on aide les prouveurs. C'est une technique courante en Event-B : mieux vaut une garde redondante qui rend les preuves triviales qu'une preuve difficile qui nécessite une intervention manuelle."

---

## CONSEILS POUR LA PRÉSENTATION

### Timing précis
- **Slides 1-2** : 1min15 (introduction)
- **Slides 3-4** : 2min (problème et méthode)
- **Slides 5-7** : 3min30 (contexte c0)
- **Slide 8** : 1min15 (m0)
- **Slides 9-11** : 4min (m1)
- **Slides 12-14** : 3min (preuves et traduction)
- **Slide 15** : 45sec (conclusion)
- **Total** : ~15min

### Points d'emphase vocale
- Insister sur "**divisors_sum**" comme la clé technique
- Bien articuler "**i commence à 0**" car c'est contre-intuitif
- Emphase sur "**100% automatiques**" pour les preuves
- Souligner "**correction par construction**"

### Gestion du rythme
- Slides 5-7 (c0) : Ne pas se presser, c'est la partie technique cruciale
- Slides 9-11 (m1) : Prendre le temps d'expliquer les gardes
- Si en retard : condenser légèrement la slide 7 (exemple)
- Si en avance : développer davantage les questions anticipées

### Langage corporel
- Pointer le schéma slide 4 lors de l'explication de l'architecture
- Montrer les tableaux slides 7 et 12 pour guider l'audience
- Utiliser les mains pour illustrer "raffinement progressif" (geste descendant)

### Mots de transition
- "Rentrons maintenant dans le détail..."
- "Voyons un exemple concret..."
- "Le point crucial ici est..."
- "Passons maintenant à..."

### Ton général
- Technique mais accessible
- Enthousiaste sur les preuves automatiques
- Pédagogique sur les choix de modélisation
- Confiant sur les résultats
