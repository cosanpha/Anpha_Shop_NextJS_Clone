import { IUser } from '@/models/UserModel'

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getUserName = (user?: IUser, exclude?: string) => {
  if (!user) return

  if (user.firstname && user.lastname) {
    return user.firstname + ' ' + user.lastname
  }

  if (user.firstname && !user.lastname) {
    return user.firstname
  }

  if (!user.firstname && user.lastname) {
    return user.lastname
  }

  if (user.username) {
    return user.username
  }
}
