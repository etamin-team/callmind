// Database utility functions

export const isValidObjectId = async (id: string): Promise<boolean> => {
  const { Types } = await import('mongoose')
  return Types.ObjectId.isValid(id)
}

export const toObjectId = async (id: string) => {
  const { Types } = await import('mongoose')
  return new Types.ObjectId(id)
}
