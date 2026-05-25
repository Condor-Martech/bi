import { CreateGroupDto } from "../../src/app/modules/groups/dto/create-group.dto";
import { Group } from "../../src/app/modules/groups/group.entity";
import { Report } from "../../src/app/modules/reports/report.entity";


export const InputGroup: CreateGroupDto = {
    name: "Administrador",
    groupIdPB: "fasdmsadsads8a54d8sad9-dsa41dsa51d",
    isReadOnly: false,
    isOnDedicatedCapacity: false,
    type: "dsadsadas"

}

export const outputGroup = new Group({
    name: 'OPERACOES',
    groupIdPB: 'fead7431-f4b9-4c12-bd6d-c1b81c1ba1ba',
    isReadOnly: false,
    isOnDedicatedCapacity: false,
    type: 'Workspace',
    reports: []
})

const report = new Report({
    "reportIdPB": "0254719c-2a33-4229-bcff-e2d901316044",
    "name": "[Teste] Mapa Condor (Danilo)",
    "webUrl": "https://app.powerbi.com/groups/me/reports/0254719c-2a33-4229-bcff-e2d901316044",
    "embedUrl": "https://app.powerbi.com/reportEmbed?reportId=0254719c-2a33-4229-bcff-e2d901316044&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLUJSQVpJTC1TT1VUSC1CLVBSSU1BUlktcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJlbWJlZEZlYXR1cmVzIjp7Im1vZGVybkVtYmVkIjp0cnVlLCJ1c2FnZU1ldHJpY3NWTmV4dCI6dHJ1ZX19",
    "datasetId": "8389fc7c-39a0-4da9-bdb2-06114c92546a",
    "groupIdPB": "65355dca-cbef-4661-8043-d7464c40a589"

})
const group = new Group(
    {
        "name": "MKT",
        "groupIdPB": "65355dca-cbef-4661-8043-d7464c40a589",
        "isReadOnly": false,
        "isOnDedicatedCapacity": false,
        "type": "Workspace",
        "reports": ["0254719c-2a33-4229-bcff-e2d901316044"]
    })
export const groupWithReport = { result: group, count: 1 };