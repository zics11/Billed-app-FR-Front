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
  describe("When I am on NewBill page, there are a mail icon in vertical layout", () => {
    test("Then, the icon should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      const isIconActivated = windowIcon.classList.contains("active-icon");
      expect(isIconActivated).toBeTruthy();
    });
  });
  describe("Then I am on NewBill page, there are a form", () => {
    test("Then, all the form input should be render correctly", () => {
      document.body.innerHTML = NewBillUI();

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

      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
  });
  describe("When I am on NewBill page, and a user upload a accepted format file", () => {
    test("Then, the file name should be correctly displayed into the input and isImgFormatValid shoud be true", () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const file = screen.getByTestId("file");

      window.alert = jest.fn();

      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(["file.png"], "file.png", { type: "image/png" })],
        },
      });

      jest.spyOn(window, "alert");
      expect(alert).not.toHaveBeenCalled();

      expect(handleChangeFile).toHaveBeenCalled();
      expect(file.files[0].name).toBe("file.png");
      expect(newBill.fileName).toBe("file.png");
      expect(newBill.isImgFormatValid).toBe(true);
      expect(newBill.formData).not.toBe(null);
    });
  });
  describe("When I am on NewBill page, and a user upload a unaccepted format file", () => {
    test("Then, the file name should not be displayed into the input, isImgFormatValid shoud be false and a alert should be displayed", () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;

      const newBill = new NewBill({ document, onNavigate, store, localStorage });
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const file = screen.getByTestId("file");

      window.alert = jest.fn();

      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
        },
      });

      jest.spyOn(window, "alert");
      expect(alert).toHaveBeenCalled();

      expect(handleChangeFile).toHaveBeenCalled();
      expect(newBill.fileName).toBe(null);
      expect(newBill.isImgFormatValid).toBe(false);
      expect(newBill.formData).toBe(undefined);
    });
  });

  describe("When I am on NewBill page, and the user click on submit button", () => {
    test("Then, the handleSubmit function should be called", () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const store = {
        bills: jest.fn(() => newBill.store),
        create: jest.fn(() => Promise.resolve({})),
        update: jest.fn(() => Promise.resolve({})),

      };

      const newBill = new NewBill({ document, onNavigate, store, localStorage });

      newBill.isImgFormatValid = true;

      const formNewBill = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn(newBill.handleSubmit);
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});

//POST
describe("When I navigate to Dashboard employee", () => {
  describe("Given I am a user connected as Employee, and a user post a newBill", () => {
    test("Add a bill from mock API POST", async () => {
      const postSpy = jest.spyOn(mockStore, "bills");
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
      const postBills = await mockStore.bills().update(bill);
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postBills).toStrictEqual(bill);
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        document.body.innerHTML = NewBillUI();

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
      });
      test("Add bills from an API and fails with 404 message error", async () => {
        const postSpy = jest.spyOn(console, "error");

        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error("404"))),
        };

        const newBill = new NewBill({ document, onNavigate, store, localStorage });
        newBill.isImgFormatValid = true;

        // Submit form
        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        fireEvent.submit(form);
        await new Promise(process.nextTick);
        expect(postSpy).toBeCalledWith(new Error("404"));
      });
      test("Add bills from an API and fails with 500 message error", async () => {
        const postSpy = jest.spyOn(console, "error");

        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error("500"))),
        };

        const newBill = new NewBill({ document, onNavigate, store, localStorage });
        newBill.isImgFormatValid = true;

        // Submit form
        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        fireEvent.submit(form);
        await new Promise(process.nextTick);
        expect(postSpy).toBeCalledWith(new Error("500"));
      });
    });
  });
});





// // Configuration de l'environnement de test JS DOM
// /**
//  * @jest-environment jsdom
//  */

// // Importation des modules nécessaires pour les tests
// import { fireEvent, screen } from "@testing-library/dom";
// import NewBillUI from "../views/NewBillUI.js";
// import NewBill from "../containers/NewBill.js";
// import mockStore from "../__mocks__/store";
// import { ROUTES, ROUTES_PATH } from "../constants/routes";
// import { localStorageMock } from "../__mocks__/localStorage.js";
// import userEvent from "@testing-library/user-event"
// import router from "../app/Router.js";

// // Simulation du magasin à l'aide de mockStore
// jest.mock("../app/store", () => mockStore)

// // Début des tests
// describe("Étant donné que je suis connecté en tant qu'employé", () => {
//   describe("Lorsque je soumets une nouvelle facture", () => {
//     // Test : Vérifie que la facture est sauvegardée
//     test("Alors la facture doit être sauvegardée", async () => {
//       // Fonction de navigation simulée
//       const onNavigate = (pathname) => {
//         document.body.innerHTML = ROUTES({ pathname })
//       }

//       // Simulation des données de l'utilisateur dans le stockage local
//       Object.defineProperty(window, "localStorage", { value: localStorageMock })
//       window.localStorage.setItem("user", JSON.stringify({
//         type: "Employee"
//       }))

//       // Génération du HTML de la vue de création de facture
//       const html = NewBillUI()
//       document.body.innerHTML = html

//       // Initialisation du composant NewBill
//       const newBillInit = new NewBill({
//         document, onNavigate, store: null, localStorage: window.localStorage
//       })

//       // Récupération du formulaire de création de facture
//       const formNewBill = screen.getByTestId("form-new-bill")
//       expect(formNewBill).toBeTruthy()

//       // Simulation de la soumission du formulaire
//       const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
//       formNewBill.addEventListener("submit", handleSubmit);
//       fireEvent.submit(formNewBill);
//       expect(handleSubmit).toHaveBeenCalled();
//     });

//     // Test : Affiche la page de création de facture
//     test("Alors affiche la page de nouvelle facture", async () => {
//       // Simulation des données de l'utilisateur dans le stockage local
//       localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.append(root)
//       router()
//       window.onNavigate(ROUTES_PATH.NewBill)
//     })

//     // Test : Vérifie si un fichier est correctement chargé
//     test("Alors vérifie la facture du fichier", async () => {
//       // Espionnage du magasin pour les factures
//       jest.spyOn(mockStore, "bills")

//       // Fonction de navigation simulée
//       const onNavigate = (pathname) => {
//         document.body.innerHTML = ROUTES({ pathname })
//       }

//       // Simulation des données de l'utilisateur dans le stockage local
//       Object.defineProperty(window, "localStorage", { value: localStorageMock })
//       Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill'] } })
//       window.localStorage.setItem("user", JSON.stringify({
//         type: "Employee"
//       }))

//       // Génération du HTML de la vue de création de facture
//       const html = NewBillUI()
//       document.body.innerHTML = html

//       // Initialisation du composant NewBill
//       const newBillInit = new NewBill({
//         document, onNavigate, store: mockStore, localStorage: window.localStorage
//       })

//       // Création d'un fichier fictif pour la simulation
//       const file = new File(['image'], 'image.png', { type: 'image/png' });

//       // Espionnage de la fonction handleChangeFile
//       const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
//       const formNewBill = screen.getByTestId("form-new-bill")
//       const billFile = screen.getByTestId('file');

//       // Ajout d'un écouteur d'événements de changement de fichier
//       billFile.addEventListener("change", handleChangeFile);

//       // Simulation de l'upload d'un fichier
//       userEvent.upload(billFile, file)

//       // Vérification si le nom du fichier est défini
//       expect(billFile.files[0].name).toBeDefined()

//       // Vérification si la fonction handleChangeFile a été appelée
//       expect(handleChangeFile).toBeCalled()

//       // Simulation de la soumission du formulaire
//       const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
//       formNewBill.addEventListener("submit", handleSubmit);
//       fireEvent.submit(formNewBill);
//       expect(handleSubmit).toHaveBeenCalled();
//     })


//   })

//   // Test : Vérifie si une erreur 404 est affichée lors d'une requête API échouée
//   test("Alors affiche une erreur 404 lors d'une requête API échouée", async () => {
//     const onNavigate = (pathname) => {
//       document.body.innerHTML = ROUTES({ pathname })
//     }

//     // Simuler une erreur 404 lors de la récupération des factures
//     mockStore.bills.mockImplementationOnce(() => {
//       return {
//         create: () => {
//           return Promise.reject(new Error("Erreur 404"))
//         }
//       }
//     })

//     // Génération du HTML de la vue de création de facture
//     const html = NewBillUI()
//     document.body.innerHTML = html

//     // Créer un composant NewBill
//     const newBillInit = new NewBill({
//       document, onNavigate, store: mockStore, localStorage: window.localStorage
//     })

//     // Simuler la soumission du formulaire
//     const formNewBill = screen.getByTestId("form-new-bill")
//     const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
//     formNewBill.addEventListener("submit", handleSubmit);
//     fireEvent.submit(formNewBill);

//     // Vérifier si le message d'erreur 404 est affiché
//     const errorMessage = await screen.getByText(/Erreur 404/)
//     expect(errorMessage).toBeTruthy();
//   })

//   // // Test : Vérifie si une erreur 500 est affichée lors d'une requête API échouée
//   // test("Alors affiche une erreur 500 lors d'une requête API échouée", async () => {
//   //   const onNavigate = (pathname) => {
//   //     document.body.innerHTML = ROUTES({ pathname })
//   //   }
//   //   // Simuler une erreur 500 lors de la récupération des factures
//   //   mockStore.bills.mockImplementationOnce(() => {
//   //     return {
//   //       create: () => {
//   //         return Promise.reject(new Error("Erreur 500"))
//   //       }
//   //     }
//   //   })

//   //       // Génération du HTML de la vue de création de facture
//   //   const html = NewBillUI()
//   //   document.body.innerHTML = html

//   //   // Créer un composant NewBill
//   //   const newBillInit = new NewBill({
//   //     document, onNavigate, store: mockStore, localStorage: window.localStorage
//   //   })

//   //   // Simuler la soumission du formulaire
//   //   const formNewBill = screen.getByTestId("form-new-bill")
//   //   const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
//   //   formNewBill.addEventListener("submit", handleSubmit);
//   //   fireEvent.submit(formNewBill);

//   //   // Vérifier si le message d'erreur 500 est affiché
//   //   const errorMessage = await screen.getByText(/Erreur 500/)
//   //   expect(errorMessage).toBeTruthy();
//   // })


// })
