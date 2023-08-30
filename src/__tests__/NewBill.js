/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";

describe("Given I am connected as an employee", () => {

  // Test pour vérifier si l'icône du courrier est mise en évidence sur la page NewBill
  describe("When I am on NewBill page, there is a mail icon in vertical layout", () => {
    test("Then, the icon should be highlighted", async () => {
      // Mock de l'environnement localStorage avec un utilisateur de type "Employee"
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Création de l'élément "root" simulé
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Initialisation de la navigation et attente de l'apparition de l'icône du courrier
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));

      // Vérification si l'icône du courrier est mise en évidence
      const windowIcon = screen.getByTestId("icon-mail");
      const isIconActivated = windowIcon.classList.contains("active-icon");
      expect(isIconActivated).toBeTruthy();
    });
  });

  // Test pour vérifier si tous les champs du formulaire sont rendus correctement sur la page NewBill
  describe("Then I am on NewBill page, there are a form", () => {
    test("Then, all the form input should be render correctly", () => {
      // Mise en place du DOM simulé avec le contenu de NewBillUI
      document.body.innerHTML = NewBillUI();
      // Récupération des éléments du formulaire
      const formNewBill = screen.getByTestId("form-new-bill");
      const type = screen.getAllByTestId("expense-type");
      const name = screen.getAllByTestId("expense-name");
      const date = screen.getAllByTestId("datepicker");
      const amount = screen.getAllByTestId("amount");
      const vat = screen.getAllByTestId("vat");
      const pct = screen.getAllByTestId("pct");
      const commentary = screen.getAllByTestId("commentary");
      const file = screen.getAllByTestId("file");
      const submitBtn = document.querySelector("#btn-send-bill");

      // Vérification de la présence de tous les éléments du formulaire
      expect(formNewBill).toBeTruthy();
      expect(type).toBeTruthy();
      expect(name).toBeTruthy();
      expect(date).toBeTruthy();
      expect(amount).toBeTruthy();
      expect(vat).toBeTruthy();
      expect(pct).toBeTruthy();
      expect(commentary).toBeTruthy();
      expect(file).toBeTruthy();
      expect(submitBtn).toBeTruthy();

      // Vérification du texte visible sur la page
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  // Test pour vérifier le comportement lorsqu'un utilisateur télécharge un fichier au format accepté
  describe("When I am on NewBill page, and a user uploads an accepted format file", () => {
    test("Then, the file name should be correctly displayed into the input and isImgFormatValid should be true", () => {
      // Mock de l'environnement avec un utilisateur de type "Employee"
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Configuration initiale de la page NewBillUI
      document.body.innerHTML = NewBillUI();

      // Fonction de simulation de la navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Mock d'un store vide (null)
      const store = null;

      // Création d'une instance de NewBill avec des configurations simulées
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });

      // Espionnage de la fonction handleChangeFile
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);

      // Récupération de l'élément "file" de l'interface
      const file = screen.getByTestId("file");

      // Mock de la fonction window.alert
      window.alert = jest.fn();

      // Écoute de l'événement de changement de fichier
      file.addEventListener("change", handleChangeFile);

      // Simulation du changement de fichier en format accepté (image PNG)
      fireEvent.change(file, {
        target: {
          files: [new File(["file.png"], "file.png", { type: "image/png" })],
        },
      });

      // Vérification que la fonction window.alert n'a pas été appelée
      expect(alert).not.toHaveBeenCalled();

      // Vérifications des appels de fonctions et des valeurs de variables
      expect(handleChangeFile).toHaveBeenCalled();
      expect(file.files[0].name).toBe("file.png");
      expect(newBill.fileName).toBe("file.png");
      expect(newBill.isImgFormatValid).toBe(true);
      expect(newBill.formData).not.toBe(null);
    });
  });


  // Test pour vérifier le comportement lorsqu'un utilisateur télécharge un fichier au format non accepté
  describe("When I am on NewBill page, and a user uploads an unaccepted format file", () => {
    test("Then, the file name should not be displayed into the input, isImgFormatValid should be false and an alert should be displayed", () => {
      // Mock de l'environnement avec un utilisateur de type "Employee"
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Configuration initiale de la page NewBillUI
      document.body.innerHTML = NewBillUI();

      // Fonction de simulation de la navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Mock d'un store vide (null)
      const store = null;

      // Création d'une instance de NewBill avec des configurations simulées
      const newBill = new NewBill({ document, onNavigate, store, localStorage });

      // Espionnage de la fonction handleChangeFile
      const handleChangeFile = jest.fn(newBill.handleChangeFile);

      // Récupération de l'élément "file" de l'interface
      const file = screen.getByTestId("file");

      // Mock de la fonction window.alert
      window.alert = jest.fn();

      // Écoute de l'événement de changement de fichier
      file.addEventListener("change", handleChangeFile);

      // Simulation du changement de fichier en format non accepté (PDF)
      fireEvent.change(file, {
        target: {
          files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
        },
      });

      // Vérification que la fonction window.alert a été appelée
      expect(alert).toHaveBeenCalled();

      // Vérifications des appels de fonctions et des valeurs de variables
      expect(handleChangeFile).toHaveBeenCalled();
      expect(newBill.fileName).toBe(null);
      expect(newBill.isImgFormatValid).toBe(false);
      expect(newBill.formData).toBe(undefined);
    });
  });

  // Test pour vérifier si la fonction handleSubmit est appelée lors du clic sur le bouton de soumission
  describe("When I am on NewBill page, and the user clicks on submit button", () => {
    test("Then, the handleSubmit function should be called", () => {
      // Mock de l'environnement avec un utilisateur de type "Employee"
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Configuration initiale de la page NewBillUI
      document.body.innerHTML = NewBillUI();

      // Fonction de simulation de la navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Mock d'un objet "store" contenant des méthodes simulées
      const store = {
        bills: jest.fn(() => newBill.store), // Mock de la méthode "bills"
        create: jest.fn(() => Promise.resolve({})), // Mock de la méthode "create"
        update: jest.fn(() => Promise.resolve({})), // Mock de la méthode "update"
      };

      // Création d'une instance de NewBill avec des configurations simulées
      const newBill = new NewBill({ document, onNavigate, store, localStorage });

      // Définition d'une variable pour simuler le format d'image valide
      newBill.isImgFormatValid = true;

      // Récupération du formulaire de l'interface
      const formNewBill = screen.getByTestId("form-new-bill");

      // Espionnage de la fonction handleSubmit
      const handleSubmit = jest.fn(newBill.handleSubmit);

      // Écoute de l'événement de soumission du formulaire
      formNewBill.addEventListener("submit", handleSubmit);

      // Simulation de la soumission du formulaire
      fireEvent.submit(formNewBill);

      // Vérification que la fonction handleSubmit a été appelée
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});

//POST
// Test d'intégration pour vérifier le comportement de l'ajout d'une facture via une requête POST simulée
describe("When I navigate to Dashboard employee", () => {
  describe("Given I am a user connected as Employee, and a user posts a newBill", () => {
    test("Add a bill from mock API POST", async () => {
      // Espionnage de la méthode "bills" dans le mockStore
      const postSpy = jest.spyOn(mockStore, "bills");

      // Données simulées d'une nouvelle facture
      const bill = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20,
      };

      // Appel simulé de la méthode update dans le mockStore
      const postBills = await mockStore.bills().update(bill);

      // Vérification que la méthode "bills" a été appelée une fois
      expect(postSpy).toHaveBeenCalledTimes(1);

      // Vérification que les données renvoyées sont identiques aux données simulées
      expect(postBills).toStrictEqual(bill);
    });

    // Suite de tests pour gérer les erreurs d'API
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        // Mock de l'utilisateur dans le localStorage
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        // Configuration initiale de la page NewBillUI
        document.body.innerHTML = NewBillUI();

        // Fonction de simulation de la navigation
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
      });

      // Test pour gérer l'erreur 404 de l'API
      test("Add bills from an API and fails with 404 message error", async () => {
        // Espionnage de la fonction console.error
        const postSpy = jest.spyOn(console, "error");

        // Mock d'un store avec des méthodes simulées
        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error("404"))),
        };

        // Création d'une instance de NewBill avec des configurations simulées
        const newBill = new NewBill({ document, onNavigate, store, localStorage });
        newBill.isImgFormatValid = true;

        // Récupération du formulaire de l'interface
        const form = screen.getByTestId("form-new-bill");

        // Espionnage de la fonction handleSubmit
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        // Simulation de la soumission du formulaire
        fireEvent.submit(form);
        await new Promise(process.nextTick);

        // Vérification que la fonction console.error a été appelée avec une erreur 404
        expect(postSpy).toBeCalledWith(new Error("404"));
      });

      // Test pour gérer l'erreur 500 de l'API
      test("Add bills from an API and fails with 500 message error", async () => {
        // Espionnage de la fonction console.error
        const postSpy = jest.spyOn(console, "error");

        // Mock d'un store avec des méthodes simulées
        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error("500"))),
        };

        // Création d'une instance de NewBill avec des configurations simulées
        const newBill = new NewBill({ document, onNavigate, store, localStorage });
        newBill.isImgFormatValid = true;

        // Récupération du formulaire de l'interface
        const form = screen.getByTestId("form-new-bill");

        // Espionnage de la fonction handleSubmit
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        // Simulation de la soumission du formulaire
        fireEvent.submit(form);
        await new Promise(process.nextTick);

        // Vérification que la fonction console.error a été appelée avec une erreur 500
        expect(postSpy).toBeCalledWith(new Error("500"));
      });
    });
  });
});

