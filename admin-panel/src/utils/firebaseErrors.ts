export const mapFirebaseError = (error: any): string => {
  const code = error?.code || error?.message || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already in use.';
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed.';
    case 'auth/weak-password':
      return 'The password is too weak.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'User not found.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
      return 'Invalid credentials provided.';
    case 'storage/unauthorized':
      return 'User is not authorized to perform the desired action.';
    case 'storage/canceled':
      return 'User canceled the operation.';
    case 'storage/unknown':
      return 'Unknown error occurred.';
    case 'permission-denied':
      return 'You do not have permission to execute this operation.';
    default:
      return error?.message || 'An unknown error occurred. Please try again.';
  }
};
