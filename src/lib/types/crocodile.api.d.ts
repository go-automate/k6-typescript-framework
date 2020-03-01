export interface LoginResponseBody {
  "refresh": string;
  "access": string;
}

export interface Crocodile{
  "id"?: number,
  "name": string,
  "sex": string,
  "date_of_birth": string,
  "age"?: number
}