const mockedBills = {
  create(bill) {
    return Promise.resolve({fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234'})
  },
  update(bill) {
    return Promise.resolve({
      "id": "47qAXb6fIm2zOKkLzMro",
      "commentAdmin": "ok",
      "email": "a@a",

      "type": 'Restaurants et bars',
      "name": 'Vol Paris Londres',
      "date": '2022-02-15',
      "amount": 200,
      "vat": 70,
      "pct": 30,
      "commentary": 'Commentary',
      "fileUrl": '../img/0.jpg',
      "fileName": 'test.jpg',
      "status": 'pending'
    })
  },
}

export default {
  bills() {
    return mockedBills
    //return {}
  },
}

