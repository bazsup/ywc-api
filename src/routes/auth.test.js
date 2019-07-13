import { pickAdminUser, pickUser } from './auth'

describe('pick user', () => {
  let user

  beforeEach(() => {
    user = {
      toObject: () => ({
        _id: '1234',
        facebook: 'FACEBOOK_ID',
        status: 'in progress',
        firstNameEN: 'Wow',
      }),
    }
  })

  const expectedUser = {
    _id: '1234',
    facebook: 'FACEBOOK_ID',
    status: 'in progress',
  }

  it('should pick correctly using ramda', () => {
    expect(pickUser(user)).toEqual(expectedUser)
  })
})

describe('pick admin', () => {
  let admin

  beforeEach(() => {
    admin = {
      _id: '1234',
    }
  })

  const expectedAdmin = { _id: '1234' }

  it('should pick correctly using ramda', () => {
    expect(pickAdminUser(admin)).toEqual(expectedAdmin)
  })
})
