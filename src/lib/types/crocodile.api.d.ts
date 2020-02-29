export interface LoginResponseBody {
  "refresh": string;
  "access": string;
}

export interface CreateCrocodileResponseBody{
  "id": number,
  "name": string,
  "sex": string,
  "date_of_birth": string,
  "age": number
}