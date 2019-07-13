import { pickCommitteeInfo, pickStaffInfo } from './users'

describe('pickStaffInfo', () => {
  const staff = {
    birthdate: '12 Aug 2019',
    sex: 'Female',
    educationStatus: 'active',
    questions: [],
    major: 'Developer',
    firstNameEN: 'Wow',
  }

  it('should pick staff detail using ramda', () => {
    const expectedStaff = {
      birthdate: '12 Aug 2019',
      sex: 'Female',
      educationStatus: 'active',
      questions: [],
      major: 'Developer',
    }

    expect(pickStaffInfo(staff)).toEqual(expectedStaff)
  })
})

describe('pickCommitteeInfo', () => {
  const committee = {
    academicYear: '2019',
    department: 'IT',
    educationStatus: 'active',
    equivalentEducationDegree: 'Bachelor',
    faculty: 'SIT',
    university: 'KMUTT',
    questions: [],
    activities: [],
    major: 'Developer',
    staffComment: 'very good',
    staffUsername: 'wow-user',
    firstNameEN: 'Wow',
  }

  it('should pick staff detail using ramda', () => {
    const expectedCommittee = {
      academicYear: '2019',
      department: 'IT',
      educationStatus: 'active',
      equivalentEducationDegree: 'Bachelor',
      faculty: 'SIT',
      university: 'KMUTT',
      questions: [],
      activities: [],
      major: 'Developer',
      staffComment: 'very good',
      staffUsername: 'wow-user',
    }

    expect(pickCommitteeInfo(committee)).toEqual(expectedCommittee)
  })
})
