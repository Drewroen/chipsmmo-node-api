import { DocumentClient, GetItemOutput } from 'aws-sdk/clients/dynamodb';
import { DynamoException } from './exceptions';

export class Dynamo {
    static async get(parameters: DynamoGetRequest, dynamoClient: DocumentClient): Promise<GetItemOutput>
    {
        return new Promise((resolve, reject) => {
            dynamoClient.get(parameters, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    }

    static put(parameters: DynamoPutRequest, dynamoClient: DocumentClient)
    {
        return dynamoClient.put(parameters, function (err) {
            if (err) {
                throw new DynamoException('Failed to put into dynamo');
            }
        })
    }

    static delete(parameters: DynamoDeleteRequest, dynamoClient: DocumentClient)
    {
        return dynamoClient.delete(parameters, function(err) {
            if (err) {
                throw new DynamoException('Failed to delete from dynamo');
            }
        })
    }
}

export class CreateAccountRequest
{
    public username: string;
    public password: string;
    public email: string;

    constructor(username: string, password: string, email: string = null)
    {
        this.username = username;
        this.password = password;
        this.email = email;
    }
}

export class UpdateAccountRequest
{
    public username: string;
    public password: string;
    public email: string;

    constructor(username: string, password: string, email: string = null)
    {
        this.username = username;
        this.password = password;
        this.email = email;
    }
}

export class LoginRequest
{
    public username: string;
    public password: string;

    constructor(username: string, password: string)
    {
        this.username = username;
        this.password = password;
    }
}

export class GetAccountInfoRequest
{
    public username: string;

    constructor(username: string)
    {
        this.username = username;
    }
}

export class UpdateTokenRequest
{
    public token: string;

    constructor(token: string)
    {
        this.token = token;
    }
}

export class LogoutRequest
{
    public username: string;

    constructor(username: string)
    {
        this.username = username;
    }
}

export class DynamoGetRequest
{
    public TableName: string;
    public Key: any;

    constructor(tableName: string, key: any)
    {
        this.TableName = tableName;
        this.Key = key;
    }
}

export class DynamoPutRequest
{
    public TableName: string;
    public Item: any;

    constructor(tableName: string, item: any)
    {
        this.TableName = tableName;
        this.Item = item;
    }
}

export class DynamoDeleteRequest
{
    public TableName: string;
    public Key: any;

    constructor(tableName: string, key: any)
    {
        this.TableName = tableName;
        this.Key = key;
    }
}