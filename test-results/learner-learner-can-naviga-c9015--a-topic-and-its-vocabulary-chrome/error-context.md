# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: learner.spec.ts >> learner can navigate from the landing page into a topic and its vocabulary
- Location: frontend/tests/e2e/learner.spec.ts:11:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.scenario-row').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.scenario-row').first() with timeout 5000ms
  - waiting for locator('.scenario-row').first()

```

```yaml
- complementary:
  - text: p . Chez Harneet FRENCH EXAM YOUR WORKSPACE
  - navigation:
    - button "Overview":
      - img
      - text: Overview
    - button "Speaking 3":
      - img
      - text: Speaking 3
    - button "Writing":
      - img
      - text: Writing
    - button "Vocabulary":
      - img
      - text: Vocabulary
    - button "Grammar":
      - img
      - text: Grammar
  - text: YOUR TOOLS
  - button "Practice room":
    - img
    - text: Practice room
  - button "Mock exam":
    - img
    - text: Mock exam
    - img
  - button "My progress":
    - img
    - text: My progress
  - img
  - text: Make real progress
  - paragraph: Unlock full practice sets and exam simulations.
  - button "Explore plans":
    - text: Explore plans
    - img
  - button "Settings":
    - img
    - text: Settings
  - text: L Learner Free learner
  - img
- main:
  - text: Workspace
  - img
  - text: Speaking
  - combobox "Interface language":
    - option "Français"
    - option "English" [selected]
  - img
  - button "Help centre":
    - img
    - text: Help centre
  - button "What's new":
    - img
  - button "Open Learner's profile": L
  - img
  - heading "Oral expression" [level=1]
  - paragraph: Prepare for the TCF Canada oral exam with real-life situations.
  - group "Oral expression tasks":
    - button "Task 1 Presentation"
    - button "Task 2 Oral interaction" [pressed]
    - button "Task 3 Argument"
  - heading "Task 2 — Oral interaction" [level=3]
  - paragraph: Exchange with the examiner in an everyday situation (asking, suggesting, accepting, refusing, getting information, etc.).
  - img
  - text: "Estimated duration: 3–4 min"
  - complementary:
    - button "Practice this task":
      - img
      - text: Practice this task
  - heading "Training topics (Task 2)" [level=2]
  - paragraph: Practise with varied situations and build confidence.
  - text: 56 topics available
  - searchbox "Search a topic"
  - group "Filter topics by category":
    - button "All (56)" [pressed]
    - button "Daily life (3)"
    - button "Studies (7)"
    - button "Work (20)"
    - button "Society (6)"
    - button "Leisure (11)"
    - button "Travel (9)"
  - button "Daily life (3 topics)" [expanded]:
    - text: Daily life (3 topics)
    - img
  - button "03 Trouver un appartement au Canada Je suis agent(e) immobilier(ère). Vous venez d'arriver au Canada et vous cherchez un appartement. Vous me posez des questions (types de logement, quartiers, prix, démarches, etc.). 25 questions 3–4 min":
    - text: 03 Trouver un appartement au Canada Je suis agent(e) immobilier(ère). Vous venez d'arriver au Canada et vous cherchez un appartement. Vous me posez des questions (types de logement, quartiers, prix, démarches, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "38 Assurance – voiture en panne Vous êtes en panne au Canada. Vous appelez votre assurance et posez des questions (dépannage, réparations, retour, etc.). 25 questions 3–4 min":
    - text: 38 Assurance – voiture en panne Vous êtes en panne au Canada. Vous appelez votre assurance et posez des questions (dépannage, réparations, retour, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "48 Restaurant Je suis votre ami. J'ai dîné dans un nouveau restaurant à Ottawa. Vous souhaitez y aller. Vous me posez des questions sur ce nouveau restaurant (menu, prix, appréciation). 25 questions 3–4 min":
    - text: 48 Restaurant Je suis votre ami. J'ai dîné dans un nouveau restaurant à Ottawa. Vous souhaitez y aller. Vous me posez des questions sur ce nouveau restaurant (menu, prix, appréciation). 25 questions
    - img
    - text: 3–4 min
  - button "Studies (7 topics)" [expanded]:
    - text: Studies (7 topics)
    - img
  - button "07 Inscrire ses enfants à l'école Je suis votre voisin(e). Vous venez d'arriver au Canada et vous souhaitez inscrire vos enfants à l'école. Vous me posez des questions (niveaux, matières, horaires, frais, etc.). 25 questions 3–4 min":
    - text: 07 Inscrire ses enfants à l'école Je suis votre voisin(e). Vous venez d'arriver au Canada et vous souhaitez inscrire vos enfants à l'école. Vous me posez des questions (niveaux, matières, horaires, frais, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "08 Fête de l'école Je suis parent d'élève. Vous allez à la fête de l'école de votre enfant pour la première fois. Vous me posez des questions (programme, horaires, activités, etc.). 25 questions 3–4 min":
    - text: 08 Fête de l'école Je suis parent d'élève. Vous allez à la fête de l'école de votre enfant pour la première fois. Vous me posez des questions (programme, horaires, activités, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "13 Cours de guitare Je suis professeur de guitare. Vous souhaitez prendre des leçons avec moi. Vous me posez des questions sur le déroulement des cours (horaires, tarifs, genre musical, etc.). 25 questions 3–4 min":
    - text: 13 Cours de guitare Je suis professeur de guitare. Vous souhaitez prendre des leçons avec moi. Vous me posez des questions sur le déroulement des cours (horaires, tarifs, genre musical, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "14 Cours de danse Je travaille dans une école de danse. Vous souhaitez prendre des cours. Vous me posez des questions sur les cours (styles de danse, horaires, tarifs, etc.). 25 questions 3–4 min":
    - text: 14 Cours de danse Je travaille dans une école de danse. Vous souhaitez prendre des cours. Vous me posez des questions sur les cours (styles de danse, horaires, tarifs, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "16 École de langues Je travaille à l'accueil d'une école de langues. Vous souhaitez suivre un cours. Vous me posez des questions (cours, niveaux, horaires, tarifs, etc.). 25 questions 3–4 min":
    - text: 16 École de langues Je travaille à l'accueil d'une école de langues. Vous souhaitez suivre un cours. Vous me posez des questions (cours, niveaux, horaires, tarifs, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "46 Être végétarien au Canada Je suis votre voisin(e) canadien(ne). Vous êtes végétarien(ne) et vous venez d'arriver au Canada. Vous me posez des questions (restaurants, plats, courses, prix, etc.). 25 questions 3–4 min":
    - text: 46 Être végétarien au Canada Je suis votre voisin(e) canadien(ne). Vous êtes végétarien(ne) et vous venez d'arriver au Canada. Vous me posez des questions (restaurants, plats, courses, prix, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "49 Étudier à l'étranger Vous vous interrogez sur la possibilité d'aller étudier à l'étranger. Vous me posez des questions (avantages, démarches, frais, logement, etc.). 25 questions 3–4 min":
    - text: 49 Étudier à l'étranger Vous vous interrogez sur la possibilité d'aller étudier à l'étranger. Vous me posez des questions (avantages, démarches, frais, logement, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "Work (20 topics)" [expanded]:
    - text: Work (20 topics)
    - img
  - button "01 Location de maison Je suis un(e) de vos collègues. Je loue ma maison pendant les vacances d'été. Vous me posez des questions sur la maison (nombre de pièces, environnement, prix, etc.). 25 questions 3–4 min":
    - text: 01 Location de maison Je suis un(e) de vos collègues. Je loue ma maison pendant les vacances d'été. Vous me posez des questions sur la maison (nombre de pièces, environnement, prix, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "02 Chambre en colocation Je suis votre collègue. Je vous propose une chambre dans ma colocation. Vous me posez des questions (loyer, chambres, colocataires, règles, etc.). 25 questions 3–4 min":
    - text: 02 Chambre en colocation Je suis votre collègue. Je vous propose une chambre dans ma colocation. Vous me posez des questions (loyer, chambres, colocataires, règles, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "06 Louer un chalet au bord de la mer Je travaille dans une agence immobilière. Vous souhaitez louer un chalet au bord de la mer pour les vacances. Vous me posez des questions (tarif, équipements, disponibilités, conditions, etc.). 25 questions 3–4 min":
    - text: 06 Louer un chalet au bord de la mer Je travaille dans une agence immobilière. Vous souhaitez louer un chalet au bord de la mer pour les vacances. Vous me posez des questions (tarif, équipements, disponibilités, conditions, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "09 S'inscrire à la ludothèque Je travaille à la ludothèque de votre ville. Vous souhaitez vous inscrire. Vous me posez des questions (horaires, tarifs, jeux, règles d'emprunt, etc.). 25 questions 3–4 min":
    - text: 09 S'inscrire à la ludothèque Je travaille à la ludothèque de votre ville. Vous souhaitez vous inscrire. Vous me posez des questions (horaires, tarifs, jeux, règles d'emprunt, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "15 Club de sport Je travaille à l'accueil d'un club de sport. Vous souhaitez vous inscrire. Vous me posez des questions (activités, horaires, abonnement, équipements, etc.). 25 questions 3–4 min":
    - text: 15 Club de sport Je travaille à l'accueil d'un club de sport. Vous souhaitez vous inscrire. Vous me posez des questions (activités, horaires, abonnement, équipements, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "19 Location de voiture Je travaille dans une agence de location de voiture. Vous voulez louer une voiture. Posez-moi des questions. 25 questions 3–4 min":
    - text: 19 Location de voiture Je travaille dans une agence de location de voiture. Vous voulez louer une voiture. Posez-moi des questions. 25 questions
    - img
    - text: 3–4 min
  - button "20 Location de vélo Je travaille dans une agence de location de vélos. Vous voulez louer un vélo pour visiter la ville. Vous me posez des questions (modèles, prix, conditions, etc.). 25 questions 3–4 min":
    - text: 20 Location de vélo Je travaille dans une agence de location de vélos. Vous voulez louer un vélo pour visiter la ville. Vous me posez des questions (modèles, prix, conditions, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "22 Mariage d'un collègue Je suis votre collègue. Je suis allé(e) à un mariage ce week-end. Vous me posez des questions sur ce mariage (lieu, invités, repas, ambiance, etc.). 25 questions 3–4 min":
    - text: 22 Mariage d'un collègue Je suis votre collègue. Je suis allé(e) à un mariage ce week-end. Vous me posez des questions sur ce mariage (lieu, invités, repas, ambiance, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "24 Sortie au spectacle Je suis une collègue. Je vous propose de m'accompagner voir un spectacle. Vous me posez des questions sur ce spectacle (genre, lieu, horaire, etc.) et sur la sortie (transport, participants). 25 questions 3–4 min":
    - text: 24 Sortie au spectacle Je suis une collègue. Je vous propose de m'accompagner voir un spectacle. Vous me posez des questions sur ce spectacle (genre, lieu, horaire, etc.) et sur la sortie (transport, participants). 25 questions
    - img
    - text: 3–4 min
  - button "25 Secrétaire du médecin Je suis le secrétaire de votre médecin. Il est en congé. Vous me posez des questions sur son remplaçant (nom, horaires, disponibilité, etc.). 23 questions 3–4 min":
    - text: 25 Secrétaire du médecin Je suis le secrétaire de votre médecin. Il est en congé. Vous me posez des questions sur son remplaçant (nom, horaires, disponibilité, etc.). 23 questions
    - img
    - text: 3–4 min
  - button "27 Travailler au Canada cet été Je travaille dans un centre d'emploi. Vous voulez travailler au Canada cet été. Vous me posez des questions (types d'emplois, régions, salaire, horaires, etc.). 25 questions 3–4 min":
    - text: 27 Travailler au Canada cet été Je travaille dans un centre d'emploi. Vous voulez travailler au Canada cet été. Vous me posez des questions (types d'emplois, régions, salaire, horaires, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "28 Nouvel emploi – ami(e) Je suis votre ami(e). Je viens d’être embauché(e) dans une entreprise. Vous me posez des questions sur mon nouvel emploi (collègues, locaux, avantages, activités, etc.). 27 questions 3–4 min":
    - text: 28 Nouvel emploi – ami(e) Je suis votre ami(e). Je viens d’être embauché(e) dans une entreprise. Vous me posez des questions sur mon nouvel emploi (collègues, locaux, avantages, activités, etc.). 27 questions
    - img
    - text: 3–4 min
  - button "29 Office de tourisme – Visite au zoo Je travaille à l'office de tourisme. Vous voulez visiter le zoo de la ville avec votre famille. Vous me posez des questions (horaires, prix, activités, restauration, etc.). 25 questions 3–4 min":
    - text: 29 Office de tourisme – Visite au zoo Je travaille à l'office de tourisme. Vous voulez visiter le zoo de la ville avec votre famille. Vous me posez des questions (horaires, prix, activités, restauration, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "31 Ancien collègue – nouveau travai Je suis votre ancien(ne) collègue. J'ai commencé un nouveau travail. Vous souhaitez changer d'emploi et vous me posez des questions (activités, salaire, collègues, etc.). 25 questions 3–4 min":
    - text: 31 Ancien collègue – nouveau travai Je suis votre ancien(ne) collègue. J'ai commencé un nouveau travail. Vous souhaitez changer d'emploi et vous me posez des questions (activités, salaire, collègues, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "32 Entretien d’embauche Je suis recruteur(se). Vous avez un entretien dans mon entreprise. Vous me posez des questions pour bien vous préparer (heure, durée, documents, but, etc.). 25 questions 3–4 min":
    - text: 32 Entretien d’embauche Je suis recruteur(se). Vous avez un entretien dans mon entreprise. Vous me posez des questions pour bien vous préparer (heure, durée, documents, but, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "35 Services à domicile Je suis votre voisin(e). Je connais une personne qui fait des petits services à domicile. Vous me posez des questions (compétences, horaires, tarifs, etc.). 25 questions 3–4 min":
    - text: 35 Services à domicile Je suis votre voisin(e). Je connais une personne qui fait des petits services à domicile. Vous me posez des questions (compétences, horaires, tarifs, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "37 Services à domicile Je suis votre voisin(e). Je connais une personne qui fait des petits services à domicile. Vous me posez des questions (compétences, horaires, tarifs, etc.). 25 questions 3–4 min":
    - text: 37 Services à domicile Je suis votre voisin(e). Je connais une personne qui fait des petits services à domicile. Vous me posez des questions (compétences, horaires, tarifs, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "44 Agence de voyage – séjour au Canada Je travaille dans une agence de voyage. Vous posez des questions sur un séjour au Canada (lieux, prix, hébergement, activités, etc.). 25 questions 3–4 min":
    - text: 44 Agence de voyage – séjour au Canada Je travaille dans une agence de voyage. Vous posez des questions sur un séjour au Canada (lieux, prix, hébergement, activités, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "45 Rencontrer des gens au Canada Je suis votre collègue. Vous venez d'arriver au Canada et vous voulez rencontrer des gens. Vous me posez des questions (activités, lieux, sorties, etc.). 25 questions 3–4 min":
    - text: 45 Rencontrer des gens au Canada Je suis votre collègue. Vous venez d'arriver au Canada et vous voulez rencontrer des gens. Vous me posez des questions (activités, lieux, sorties, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "51 Chef cuisinier à domicile Je suis chef cuisinier à domicile. Vous organisez un repas de famille et posez des questions sur mes prestations (menus, tarifs, matériel, etc.). 25 questions 3–4 min":
    - text: 51 Chef cuisinier à domicile Je suis chef cuisinier à domicile. Vous organisez un repas de famille et posez des questions sur mes prestations (menus, tarifs, matériel, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "Society (6 topics)" [expanded]:
    - text: Society (6 topics)
    - img
  - button "04 Meubles à vendre Je suis votre voisin(e). Je pars vivre à l'étranger et je vends mes meubles. Vous me posez des questions (type de meubles, état, prix, livraison, etc.). 25 questions 3–4 min":
    - text: 04 Meubles à vendre Je suis votre voisin(e). Je pars vivre à l'étranger et je vends mes meubles. Vous me posez des questions (type de meubles, état, prix, livraison, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "23 Nouveau quartier Je suis votre voisin. Vous êtes nouveau dans le quartier et vous voulez sortir le soir. Posez-moi des questions (lieux, activités, prix). 25 questions 3–4 min":
    - text: 23 Nouveau quartier Je suis votre voisin. Vous êtes nouveau dans le quartier et vous voulez sortir le soir. Posez-moi des questions (lieux, activités, prix). 25 questions
    - img
    - text: 3–4 min
  - button "26 Trouver un médecin Je suis votre voisin(e). Vous venez d'arriver au Québec et vous cherchez un médecin. Vous me posez des questions (cliniques, rendez-vous, frais, urgences, etc.). 25 questions 3–4 min":
    - text: 26 Trouver un médecin Je suis votre voisin(e). Vous venez d'arriver au Québec et vous cherchez un médecin. Vous me posez des questions (cliniques, rendez-vous, frais, urgences, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "30 Bénévolat – protection animale Je suis membre d'une association de protection animale. Je vous invite à nous rejoindre. Vous me posez des questions sur l'association (activités, services, public concerné, etc.). 25 questions 3–4 min":
    - text: 30 Bénévolat – protection animale Je suis membre d'une association de protection animale. Je vous invite à nous rejoindre. Vous me posez des questions sur l'association (activités, services, public concerné, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "40 Covoiturage Je suis votre voisin(e). Je propose du covoiturage pour aller au travail. Vous êtes intéressé(e). Vous me posez des questions (horaires, trajet, prix, organisation, etc.). 25 questions 3–4 min":
    - text: 40 Covoiturage Je suis votre voisin(e). Je propose du covoiturage pour aller au travail. Vous êtes intéressé(e). Vous me posez des questions (horaires, trajet, prix, organisation, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "53 Aider au déménagement Vous m'aidez à déménager et vous posez des questions sur l'organisation (date, lieu, participants, matériel, etc.). 25 questions 3–4 min":
    - text: 53 Aider au déménagement Vous m'aidez à déménager et vous posez des questions sur l'organisation (date, lieu, participants, matériel, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "Leisure (11 topics)" [expanded]:
    - text: Leisure (11 topics)
    - img
  - button "10 Cadeau pour l'enfant d'un ami Je suis votre ami(e). Mon fils fête bientôt son anniversaire. Vous voulez lui offrir un cadeau. Vous me posez des questions sur ses goûts (jeux, loisirs, habitudes, etc.). 25 questions 3–4 min":
    - text: 10 Cadeau pour l'enfant d'un ami Je suis votre ami(e). Mon fils fête bientôt son anniversaire. Vous voulez lui offrir un cadeau. Vous me posez des questions sur ses goûts (jeux, loisirs, habitudes, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "18 Club de randonnée Leisure 1 questions 3–4 min":
    - text: 18 Club de randonnée Leisure 1 questions
    - img
    - text: 3–4 min
  - button "21 Organisation d’une fête d’anniversaire Je suis votre ami. J’organise ma fête d’anniversaire. Vous voulez m’aider. Vous me posez des questions sur la préparation (repas, décoration, invités, etc.). 23 questions 3–4 min":
    - text: 21 Organisation d’une fête d’anniversaire Je suis votre ami. J’organise ma fête d’anniversaire. Vous voulez m’aider. Vous me posez des questions sur la préparation (repas, décoration, invités, etc.). 23 questions
    - img
    - text: 3–4 min
  - button "34 Visite au musée Je suis employé(e) à la réception d'un musée. Vous organisez une visite en famille et vous me posez des questions. 22 questions 3–4 min":
    - text: 34 Visite au musée Je suis employé(e) à la réception d'un musée. Vous organisez une visite en famille et vous me posez des questions. 22 questions
    - img
    - text: 3–4 min
  - button "36 Acheter et Livraison de meubles Je suis employé(e) d’une boutique de meuble. Vous posez des questions sur la meuble et livraison (, type de meuble ,coût, délai, moyens de transport, etc.). 25 questions 3–4 min":
    - text: 36 Acheter et Livraison de meubles Je suis employé(e) d’une boutique de meuble. Vous posez des questions sur la meuble et livraison (, type de meuble ,coût, délai, moyens de transport, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "39 Transports en commun Je suis votre ami(e) canadien(ne). Je vous accueille chez moi à Montréal. Vous me posez des questions sur les transports en commun (types de transport, trajets, horaires, prix, etc.). 25 questions 3–4 min":
    - text: 39 Transports en commun Je suis votre ami(e) canadien(ne). Je vous accueille chez moi à Montréal. Vous me posez des questions sur les transports en commun (types de transport, trajets, horaires, prix, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "42 Le Nouvel An au Canada Je suis votre professeur(e) de français. Vous allez passer le Nouvel An au Canada. Vous me posez des questions sur cette fête (traditions, repas, activités, etc.). 25 questions 3–4 min":
    - text: 42 Le Nouvel An au Canada Je suis votre professeur(e) de français. Vous allez passer le Nouvel An au Canada. Vous me posez des questions sur cette fête (traditions, repas, activités, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "52 Fête des voisins Je suis votre voisin(e). J'organise une fête pour les habitants de l'immeuble. Vous me posez des questions (date, invités, nourriture, activités, etc.). 25 questions 3–4 min":
    - text: 52 Fête des voisins Je suis votre voisin(e). J'organise une fête pour les habitants de l'immeuble. Vous me posez des questions (date, invités, nourriture, activités, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "54 Article sur un livre Vous devez écrire un article pour une revue. Vous me posez des questions sur mes lectures récentes. 25 questions 3–4 min":
    - text: 54 Article sur un livre Vous devez écrire un article pour une revue. Vous me posez des questions sur mes lectures récentes. 25 questions
    - img
    - text: 3–4 min
  - button "55 Article sur un film Vous devez rédiger un article sur un film. Vous me posez des questions sur les films que j'ai appréciés. 25 questions 3–4 min":
    - text: 55 Article sur un film Vous devez rédiger un article sur un film. Vous me posez des questions sur les films que j'ai appréciés. 25 questions
    - img
    - text: 3–4 min
  - button "56 Participer à une émission de télévision Je suis votre ami(e). J'ai participé à une émission de télévision. Vous voulez participer aussi. Vous me posez des questions (inscription, déroulement, présentateur, etc.). 25 questions 3–4 min":
    - text: 56 Participer à une émission de télévision Je suis votre ami(e). J'ai participé à une émission de télévision. Vous voulez participer aussi. Vous me posez des questions (inscription, déroulement, présentateur, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "Travel (9 topics)" [expanded]:
    - text: Travel (9 topics)
    - img
  - button "05 Garder la maison d'un ami Je suis votre ami(e). Je pars en vacances pendant deux semaines. Je vous demande de garder ma maison. Vous me posez des questions (tâches, durée, urgences, etc.). 24 questions 3–4 min":
    - text: 05 Garder la maison d'un ami Je suis votre ami(e). Je pars en vacances pendant deux semaines. Je vous demande de garder ma maison. Vous me posez des questions (tâches, durée, urgences, etc.). 24 questions
    - img
    - text: 3–4 min
  - button "11 Garder un enfant Je suis un ami. Je dois m’absenter un week-end. Je vous demande de garder mon enfant. Vous me posez des questions pour connaître ses habitudes (alimentation, loisirs, sommeil, etc.). 25 questions 3–4 min":
    - text: 11 Garder un enfant Je suis un ami. Je dois m’absenter un week-end. Je vous demande de garder mon enfant. Vous me posez des questions pour connaître ses habitudes (alimentation, loisirs, sommeil, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "12 Garder le chien d'un voisin Je suis votre voisin(e). Je pars en vacances pendant une semaine. Je vous demande de garder mon chien. Vous me posez des questions (durée, repas, promenades, paiement, etc.). 25 questions 3–4 min":
    - text: 12 Garder le chien d'un voisin Je suis votre voisin(e). Je pars en vacances pendant une semaine. Je vous demande de garder mon chien. Vous me posez des questions (durée, repas, promenades, paiement, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "17 Festival de musique Je suis votre ami(e). J'organise un festival de musique dans notre ville. Vous me posez des questions (dates, artistes, lieu, billets, etc.). 25 questions 3–4 min":
    - text: 17 Festival de musique Je suis votre ami(e). J'organise un festival de musique dans notre ville. Vous me posez des questions (dates, artistes, lieu, billets, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "33 Anniversaire sur un bateau Je suis votre ami(e). J’organise mon anniversaire sur un bateau. Vous me posez des questions pour en savoir plus (organisation, prix, invités, activités, etc.). 25 questions 3–4 min":
    - text: 33 Anniversaire sur un bateau Je suis votre ami(e). J’organise mon anniversaire sur un bateau. Vous me posez des questions pour en savoir plus (organisation, prix, invités, activités, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "41 Ami de retour d'un voyage au Canada Je suis votre ami(e). Je reviens d'un séjour de deux semaines au Canada. Vous voulez y aller aussi. Vous me posez des questions sur mon voyage (villes, climat, logement, prix, etc.). 25 questions 3–4 min":
    - text: 41 Ami de retour d'un voyage au Canada Je suis votre ami(e). Je reviens d'un séjour de deux semaines au Canada. Vous voulez y aller aussi. Vous me posez des questions sur mon voyage (villes, climat, logement, prix, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "43 Week-end dans une ville Je suis votre ami(e). Je connais très bien la ville de Québec. Des amis viennent vous rendre visite et vous voulez organiser un week-end à Québec. Vous me posez des questions (visites, restaurants, sorties, transport, etc.). 25 questions 3–4 min":
    - text: 43 Week-end dans une ville Je suis votre ami(e). Je connais très bien la ville de Québec. Des amis viennent vous rendre visite et vous voulez organiser un week-end à Québec. Vous me posez des questions (visites, restaurants, sorties, transport, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "47 Réservation d'hôtel Vous souhaitez réserver une chambre d'hôtel. Vous posez des questions (prix, services, types de chambre, etc.). 25 questions 3–4 min":
    - text: 47 Réservation d'hôtel Vous souhaitez réserver une chambre d'hôtel. Vous posez des questions (prix, services, types de chambre, etc.). 25 questions
    - img
    - text: 3–4 min
  - button "50 Vacances au bord de la mer Un ami revient de vacances au bord de la mer et partage son expérience. Vous l'interrogez sur la destination, les activités disponibles et les coûts afin d'organiser un séjour similaire. 25 questions 3–4 min":
    - text: 50 Vacances au bord de la mer Un ami revient de vacances au bord de la mer et partage son expérience. Vous l'interrogez sur la destination, les activités disponibles et les coûts afin d'organiser un séjour similaire. 25 questions
    - img
    - text: 3–4 min
  - text: Chez Harneet Made for your next French milestone. Independent French preparation · Not an official examination provider
- alert
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | 
  4   | async function setEnglish(page: import("@playwright/test").Page) {
  5   |   await page.goto("/");
  6   |   await page.evaluate(() => localStorage.setItem("chez-harneet-language", "en"));
  7   |   await page.reload({ waitUntil: "domcontentloaded" });
  8   |   await page.waitForFunction(() => document.documentElement.lang === "en");
  9   | }
  10  | 
  11  | test("learner can navigate from the landing page into a topic and its vocabulary", async ({ page }) => {
  12  |   const consoleErrors: string[] = [];
  13  |   page.on("pageerror", (error) => consoleErrors.push(error.message));
  14  |   await setEnglish(page);
  15  |   await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  16  | 
  17  |   await page.getByRole("button", { name: "Open learning space" }).first().click();
  18  |   await expect(page).toHaveURL(/\/dashboard$/);
  19  |   await expect(page.getByText("Your learning path")).toBeVisible();
  20  | 
  21  |   await page.locator(".nav-link").filter({ hasText: "Speaking" }).click();
  22  |   await expect(page).toHaveURL(/\/speaking$/);
  23  |   const firstScenario = page.locator(".scenario-row").first();
> 24  |   await expect(firstScenario).toBeVisible();
      |                               ^ Error: expect(locator).toBeVisible() failed
  25  |   const topicTitle = (await firstScenario.locator("b").innerText()).trim();
  26  |   await firstScenario.click();
  27  | 
  28  |   await expect(page).toHaveURL(/\/practice$/);
  29  |   await expect(page.getByRole("heading", { level: 1, name: topicTitle })).toBeVisible();
  30  |   await expect(page.getByRole("heading", { name: "Vocabulary for this topic" })).toBeVisible();
  31  |   await expect(page.locator(".topic-vocab-item").first()).toBeVisible();
  32  |   expect(consoleErrors).toEqual([]);
  33  | });
  34  | 
  35  | test("vocabulary search and bookmarks work, and vocabulary is grouped by topic", async ({ page }) => {
  36  |   await setEnglish(page);
  37  |   await page.goto("/vocabulary");
  38  |   const search = page.getByPlaceholder("Search a phrase, meaning, or example…");
  39  |   await search.fill("neighbourhood");
  40  |   const locationGroup = page.locator(".vocab-topic-group").filter({ has: page.getByRole("heading", { name: "Location de maison" }) });
  41  |   await expect(locationGroup.getByRole("heading", { name: "un quartier" })).toBeVisible();
  42  |   await expect(page.locator(".vocab-card").first()).toBeVisible();
  43  | 
  44  |   await search.clear();
  45  |   const bookmark = page.getByRole("button", { name: "Save phrase" }).first();
  46  |   await bookmark.click();
  47  |   await expect(bookmark).toHaveClass(/is-saved/);
  48  | });
  49  | 
  50  | test("writing screen explains that no writing prompts are published", async ({ page }) => {
  51  |   await setEnglish(page);
  52  |   await page.goto("/writing");
  53  |   await expect(page.getByRole("heading", { name: "Writing studio" })).toBeVisible();
  54  |   await expect(page.getByText(/No writing prompts are published yet/)).toBeVisible();
  55  |   await expect(page.getByRole("button", { name: "Start writing" })).toBeDisabled();
  56  | });
  57  | 
  58  | test("login and upgrade dialogs can be opened and dismissed", async ({ page }) => {
  59  |   await setEnglish(page);
  60  |   await page.getByRole("button", { name: "Sign in" }).first().click();
  61  |   await expect(page.getByRole("heading", { name: "Your learning, all in one place." })).toBeVisible();
  62  |   await page.getByRole("button", { name: "Close dialog" }).click();
  63  |   await expect(page.locator(".modal-backdrop")).toHaveCount(0);
  64  | 
  65  |   await page.goto("/pricing");
  66  |   await page.getByRole("button", { name: "Join the waitlist" }).click();
  67  |   await expect(page.locator(".modal-card")).toBeVisible();
  68  |   await page.locator(".modal-backdrop").click({ position: { x: 4, y: 4 } });
  69  |   await expect(page.locator(".modal-backdrop")).toHaveCount(0);
  70  | });
  71  | 
  72  | test("core pages render without horizontal overflow at supported viewport widths", async ({ page }) => {
  73  |   await setEnglish(page);
  74  |   await page.goto("/dashboard");
  75  |   for (const width of [320, 375, 768, 1024, 1440]) {
  76  |     await page.setViewportSize({ width, height: 900 });
  77  |     await expect(page.getByRole("heading", { name: "Your learning path" })).toBeVisible();
  78  |     const dimensions = await page.evaluate(() => ({
  79  |       viewport: document.documentElement.clientWidth,
  80  |       page: document.documentElement.scrollWidth,
  81  |     }));
  82  |     const offenders = dimensions.page > dimensions.viewport + 1 ? await page.locator("body *").evaluateAll((elements) => elements.map((element) => {
  83  |       const rect = element.getBoundingClientRect();
  84  |       return { tag: element.tagName, className: typeof element.className === "string" ? element.className : "", right: Math.round(rect.right), width: Math.round(rect.width) };
  85  |     }).filter((element) => element.right > window.innerWidth + 1).slice(0, 8)) : [];
  86  |     expect(dimensions.page, `horizontal overflow at ${width}px: ${JSON.stringify(offenders)}`).toBeLessThanOrEqual(dimensions.viewport + 1);
  87  |   }
  88  | });
  89  | 
  90  | test("public learner screens have no serious automated accessibility violations", async ({ page }) => {
  91  |   await setEnglish(page);
  92  |   for (const route of ["/", "/dashboard", "/speaking", "/writing", "/vocabulary", "/grammar", "/practice", "/pricing", "/admin"]) {
  93  |     await page.goto(route);
  94  |     const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  95  |     const serious = results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""));
  96  |     const summary = serious.map(({ id, impact, help, nodes }) => ({ id, impact, help, count: nodes.length }));
  97  |     if (serious.length) {
  98  |       const colorSamples = [...new Map(serious.flatMap((violation) => violation.nodes.map((node) => {
  99  |         const fg = node.any?.[0]?.data?.fgColor;
  100 |         const bg = node.any?.[0]?.data?.bgColor;
  101 |         return [`${fg} on ${bg}`, { fg, bg, sample: node.target.join(" ") }] as const;
  102 |       }))).values()];
  103 |       console.log(route, JSON.stringify(colorSamples));
  104 |     }
  105 |     expect(serious, `${route}: ${JSON.stringify(summary)}`).toEqual([]);
  106 |   }
  107 | });
  108 | 
```