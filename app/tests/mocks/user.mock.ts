
import { CreateUserDto, ROLE_TYPES } from "../../src/app/modules/users/dto/create-user.dto";
import { User } from "../../src/app/modules/users/user.entity";

export const userInput: CreateUserDto = {
    name: "Diego",
    password: "d51sa56d1sa5",
    email: " diego1@hotmail.com",
    role: ROLE_TYPES.MANAGER,
    accountUser: 's5a1d5sa1d5sa1d5sa1',
    reportIdPB: ['d1sa5d1sa5d1sa', 'dsa5d1sa5d1sa51dsa5'],
    groupIdPB: ['sd51sa5d1sa51d5sa']

}

export const updateResult = {
    name: "Edu",
    password: "$2b$12$1219oTAsjNLRtYsdCiZjA.Z6wJ9lcMOkbMjz/J7XiLGyFcqRAR5aC",
    email: "diego.lima@condor.com.br",
    role: "user",
    accountID: [
        "64a2dd18710414af1a9d6696"
    ],
    groupByPB: [
        "65355dca-cbef-4661-8043-d7464c40a589"
    ],
    reportsByPB: [
        "398a8002-68f6-444c-983f-5b906021f399",
        "29f82e7b-ba4d-4e8a-b75d-abb5f88c7ab7",
        "6dbf1114-ec5d-45e4-8eda-115ee18fe0ad",
        "89fc23e5-3c4f-499e-bf4f-f3cde43bf397",
        "d260bd66-c954-4e78-a4e3-2473b95571e6",
        "ab011ada-47f7-46ca-9f0c-b03ff6186a0f",
        "1c5b1cdd-2e22-42ce-baaa-495eb2e5cb24"
    ],

}

export const user = {
    "name": "Diego",
    password: 's1ad2sa1d2as',
    "role": "manager",
    "email": "diego.lima@condor.com.br",
    accountID: [
        '64f737c1af79c52157949233'

    ]
}