/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES,ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
import "@testing-library/jest-dom";
import userEvent from '@testing-library/user-event'

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // L'expression expect pour vérifier si l'icône est mise en évidence
      expect(windowIcon).toHaveClass('active-icon');
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

describe("When I click on Nouvelle note de frais", () => {
  // Vérifie si le formulaire de création de bills apparait
  test("Then the form to create a new bill appear", async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
    window.localStorage.setItem("user", JSON.stringify({
      type: "Employee"
    }))
    const billsInit = new Bills({
      document, onNavigate, store: null, localStorage: window.localStorage
    })
    document.body.innerHTML = BillsUI({ data: bills })
    const handleClickNewBill = jest.fn(() => billsInit.handleClickNewBill ())
    const btnNewBill = screen.getByTestId("btn-new-bill")
    btnNewBill.addEventListener("click", handleClickNewBill)
    userEvent.click(btnNewBill)
    expect(handleClickNewBill).toHaveBeenCalled()
    await waitFor(() => screen.getByTestId("form-new-bill"))
    expect(screen.getByTestId("form-new-bill")).toBeTruthy()
  })
})



describe("When I click on the eye of a bill", () => {
  test("Then a modal must appear", async () => {
    const mockOnNavigate = jest.fn();
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    const billsInit = new Bills({
      document,
      onNavigate: mockOnNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    document.body.innerHTML = BillsUI({ data: bills });
    const iconEyeList = screen.getAllByTestId("icon-eye");

    $.fn.modal = jest.fn();

    const handleClickIconEye = jest.fn(icon => billsInit.handleClickIconEye(icon));
    iconEyeList.forEach(icon => {
      icon.addEventListener("click", () => handleClickIconEye(icon));
      userEvent.click(icon);
      expect(handleClickIconEye).toHaveBeenCalledWith(icon);
    });

    expect($.fn.modal).toHaveBeenCalledWith('show');
  });
});

describe('Bills class', () => {
  test('getBills should return bills in the correct format', async () => {
    const mockStore = {
      bills: jest.fn().mockReturnThis(),
      list: jest.fn().mockResolvedValue([
        { date: '2023-08-10', status: 'pending' },
        { date: '2023-08-09', status: 'approved' }
      ])
    };

    const billsInstance = new Bills({
      document: window.document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: localStorageMock
    });

    const bills = await billsInstance.getBills();

    expect(bills).toEqual([
      { date: 'August 10, 2023', status: 'Pending' },
      { date: 'August 9, 2023', status: 'Approved' }
    ]);
  });
});


// Intégration