/**
 * @jest-environment jsdom
 */

import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import { fireEvent, screen, waitFor } from '@testing-library/dom'
import { ROUTES, ROUTES_PATH } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
import mockStore from '../__mocks__/store'
import router from '../app/Router.js'
import userEvent from '@testing-library/user-event'

jest.mock('../app/store', () => mockStore)

describe('Given I am connected as an employee', () => {
  describe('When I am on New Bills Page', () => {
    beforeEach(() => {
      // Configure localStorage avec un utilisateur de type employé
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee'
        })
      )
      // Crée un élément racine pour l'application
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      // Initialise le routeur de l'application et navigue vers la page Nouvelle note de frais
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })
    
    test('Then new bill icon in vertical layout should be highlighted', async () => {
      // Attend que l'icône de messagerie soit visible et vérifie qu'elle a la classe 'active-icon'
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.classList[0]).toBe('active-icon')
    })
    
    describe('When a file is selected through file input', () => {
      test('Then selecting image files (.jpg, .jpeg, .png) should work and no alert is displayed', () => {
        // Simule la fonction onNavigate pour configurer le chemin d'accès souhaité
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        // Initialise NewBill et configure l'interface utilisateur avec le fichier d'entrée
        const employeeNewBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        })
        // Espionne la fonction 'alert' pour éviter d'afficher une boîte de dialogue
        jest.spyOn(window, 'alert').mockImplementation(() => {})
        // Sélectionne l'élément d'entrée de fichier et simule un changement de fichier
        const fileInput = screen.getByTestId('file')
        const handleChangeFile = jest.fn(employeeNewBill.handleChangeFile)
        fileInput.addEventListener('change', (e) => handleChangeFile(e))
        const file = new File(['test'], 'test.png', { type: 'image/png' })
        userEvent.upload(fileInput, file)
        // Vérifie que la fonction handleChangeFile a été appelée, qu'aucune alerte n'a été affichée et que le fichier a été sélectionné
        expect(handleChangeFile).toHaveBeenCalled()
        expect(window.alert).not.toHaveBeenCalled()
        expect(fileInput.files[0]).toStrictEqual(file)
      })
      
      test('Then selecting wrong files should display an alert', () => {
        // Simule la fonction onNavigate pour configurer le chemin d'accès souhaité
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        // Initialise NewBill et configure l'interface utilisateur avec le fichier d'entrée
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        })
        // Espionne la fonction 'alert' pour vérifier qu'elle est appelée
        jest.spyOn(window, 'alert').mockImplementation(() => {})
        // Sélectionne l'élément d'entrée de fichier et simule un changement de fichier incorrect
        const inputFile = screen.getByTestId('file')
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        inputFile.addEventListener('change', (e) => handleChangeFile(e))
        const file = new File(['text'], 'text.txt', { type: 'text/plain' })
        userEvent.upload(inputFile, file)
        // Vérifie que la fonction handleChangeFile a été appelée, que l'alerte a été affichée et que le fichier n'a pas été sélectionné
        expect(handleChangeFile).toHaveBeenCalled()
        expect(window.alert).toHaveBeenCalled
        expect(inputFile.value.length).toBe(0)
      })
    })
  })
  
  describe('Given I am connected as an employee', () => {
    describe('When I am on NewBill Page and I submit the form with an image (jpg, jpeg, png)', () => {
      test('Then it should create a new bill', () => {
        // Simule la fonction onNavigate pour configurer le chemin d'accès souhaité
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        // Configure localStorage avec un utilisateur de type employé
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock
        })
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee'
          })
        )
        // Initialise l'interface utilisateur avec le formulaire de nouvelle note de frais
        document.body.innerHTML = NewBillUI()
        // Initialise NewBill
        const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage
        })
        // Espionne la fonction handleSubmit pour vérifier qu'elle est appelée lors de la soumission du formulaire
        const handleSubmit = jest.fn(newBill.handleSubmit)
        const submitBtn = screen.getByTestId('form-new-bill')
        submitBtn.addEventListener('submit', handleSubmit)
        fireEvent.submit(submitBtn)
        // Vérifie que la fonction handleSubmit a été appelée
        expect(handleSubmit).toHaveBeenCalled()
      })
    })
  })
})

// Test d'intégration POST :
describe('Given I am a user connected as Employee', () => {
  describe('When I submit the form completed', () => {
    test('Then the bill is created', async () => {
      // Initialise l'interface utilisateur avec le formulaire de nouvelle note de frais
      document.body.innerHTML = NewBillUI()
      // Simule la fonction onNavigate pour configurer le chemin d'accès souhaité
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Configure localStorage avec un utilisateur de type employé
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee'
        })
      )
      // Initialise NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })
      // Définit une note de frais valide pour les tests
      const validBill = {
        type: 'Restaurants et bars',
        name: 'Vol Paris Londres',
        date: '2022-02-15',
        amount: 200,
        vat: 70,
        pct: 30,
        commentary: 'Commentary',
        fileUrl: '../img/0.jpg',
        fileName: 'test.jpg',
        status: 'pending'
      }
      // Remplit les champs du formulaire avec les valeurs de la note de frais valide
      screen.getByTestId('expense-type').value = validBill.type
      screen.getByTestId('expense-name').value = validBill.name
      screen.getByTestId('datepicker').value = validBill.date
      screen.getByTestId('amount').value = validBill.amount
      screen.getByTestId('vat').value = validBill.vat
      screen.getByTestId('pct').value = validBill.pct
      screen.getByTestId('commentary').value = validBill.commentary
      // Configure les propriétés de NewBill avec les informations de la note de frais valide
      newBill.fileName = validBill.fileName
      newBill.fileUrl = validBill.fileUrl
      // Espionne la fonction updateBill pour vérifier qu'elle est appelée
      newBill.updateBill = jest.fn()
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      // Sélectionne le formulaire de nouvelle note de frais et simule sa soumission
      const form = screen.getByTestId('form-new-bill')
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      // Vérifie que la fonction handleSubmit a été appelée et que la fonction updateBill a été appelée
      expect(handleSubmit).toHaveBeenCalled()
      expect(newBill.updateBill).toHaveBeenCalled()
    })

    test('fetches error from an API and fails with 500 error', async () => {
      // Espionne la fonction bills du store et la console pour éviter d'afficher des messages d'erreur
      jest.spyOn(mockStore, 'bills')
      jest.spyOn(console, 'error').mockImplementation(() => {}) 
      // Configure localStorage avec un utilisateur de type employé
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      // Crée un élément racine pour l'application
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      // Initialise le routeur de l'application
      router()
      // Simule la fonction onNavigate pour configurer le chemin d'accès souhaité
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Simule une erreur 500 lors de la mise à jour de la note de frais dans le store
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 500'))
          }
        }
      })
      // Initialise NewBill
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      // Sélectionne le formulaire de nouvelle note de frais et simule sa soumission
      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      // Attend que la promesse soit résolue
      await new Promise(process.nextTick)
      // Vérifie que la fonction console.error a été appelée
      expect(console.error).toBeCalled()
    })
  })
})
