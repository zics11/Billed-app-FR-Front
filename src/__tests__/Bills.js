/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
import mockStore from '../__mocks__/store'
import router from '../app/Router.js'
import Bills from '../containers/Bills.js'

jest.mock('../app/store', () => mockStore)

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem(
    'user',
    JSON.stringify({
      type: 'Employee'
    })
  )
})

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList[0]).toBe('active-icon')
    })
    // [Bug report] - Bills ---- rajout de la fonction async pour attendre les données du back
    test('Then bills should be ordered from earliest to latest', async () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML)
      const antiChrono = (a, b) => (a < b ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  // TEST UNITAIRE RAJOUTE :

  describe('When I am on Bills page but it is loading', () => {
    test('Then I should land on a loading page', () => {
      // Crée une interface utilisateur avec une indication de chargement
      const html = BillsUI({ data: [], loading: true })
      document.body.innerHTML = html
      // Vérifie que le texte "Loading..." est présent à l'écran
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe('When I am on Bills page but back-end sends an error message', () => {
    test('Then I should land on an error page', () => {
      // Crée une interface utilisateur avec un message d'erreur
      const html = BillsUI({ data: [], loading: false, error: 'Oops!' })
      document.body.innerHTML = html
      // Vérifie que le texte "Erreur" est présent à l'écran
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe('When I click on new bill button', () => {
    test('Then I should be sent to the new bill page', () => {
      // Simule la fonction onNavigate pour configurer le chemin d'accès souhaité
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Initialise Bills et configure l'interface utilisateur avec des données de facturation
      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({ data: bills, loading: false })
      // Sélectionne le bouton "Nouvelle note de frais" et simule un clic
      const newBillButton = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill())
      newBillButton.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillButton)
      // Vérifie que la fonction handleClickNewBill a été appelée et que le texte "Envoyer une note de frais" est présent à l'écran
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })

  describe('When I click on eye icon', () => {
    test('Then it should open the bill modal with corresponding content', () => {
      // Configure l'interface utilisateur avec des données de facturation
      document.body.innerHTML = BillsUI({ data: bills })
      // Simule la fonction onNavigate pour configurer le chemin d'accès souhaité
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Initialise Bills et configure la fenêtre modale
      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })
      $.fn.modal = jest.fn()
      // Sélectionne l'icône de l'œil et simule un clic
      const iconEye = screen.getAllByTestId('icon-eye')
      const eye = iconEye[0]
      userEvent.click(eye)
      // Récupère la fenêtre modale et l'URL de la note de frais
      const modale = screen.getByTestId('modaleFile')
      const billUrl = eye.getAttribute('data-bill-url').split('?')[0]
      // Vérifie que l'URL de la note de frais est contenu dans la fenêtre modale et que la fenêtre modale a été ouverte
      expect(modale.innerHTML).toContain(billUrl)
      expect(modale).toBeTruthy()
      expect($.fn.modal).toHaveBeenCalled()
    })
  })
})

// test d'intégration GET :
describe('Given I am a user connected as Employee', () => {
  describe('When I navigate to Bill', () => {
    test("fetches Employee's bill from mock API GET", async () => {
      // Configuration de l'utilisateur en tant qu'employé dans localStorage
      localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }))
      // Crée un élément racine pour l'application
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      // Initialise le routeur de l'application
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // Attend que l'interface utilisateur affiche "Mes notes de frais"
      await waitFor(() => screen.getByText('Mes notes de frais'))
      // Vérifie que le texte "Transports" est présent à l'écran (une note de frais spécifique)
      const transportBill = screen.getByText('Transports')
      expect(transportBill).toBeTruthy()
    })

    describe('When an error occurs on API', () => {
      beforeEach(() => {
        // Espionne la fonction 'bills' du store pour simuler des erreurs
        jest.spyOn(mockStore, 'bills')
        // Configure localStorage avec un utilisateur de type employé
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
            email: 'a@a'
          })
        )
        // Crée un élément racine pour l'application
        const root = document.createElement('div')
        root.setAttribute('id', 'root')
        document.body.appendChild(root)
        // Initialise le routeur de l'application
        router()
      })

      test('fetches bills from an API and fails with 404 message error', async () => {
        // Simule une erreur 404
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error('Erreur 404'))
            }
          }
        })
        // Navigue vers la page des note de frais
        window.onNavigate(ROUTES_PATH.Bills)
        // Attend que la promesse soit résolue
        await new Promise(process.nextTick)
        // Vérifie que le message d'erreur "Erreur 404" est présent à l'écran
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test('fetches messages from an API and fails with 500 message error', async () => {
        // Simule une erreur 500
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error('Erreur 500'))
            }
          }
        })
        // Navigue vers la page des note de frais
        window.onNavigate(ROUTES_PATH.Bills)
        // Attend que la promesse soit résolue
        await new Promise(process.nextTick)
        // Vérifie que le message d'erreur "Erreur 500" est présent à l'écran
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})
