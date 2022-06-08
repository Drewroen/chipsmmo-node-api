import * as jwt from 'jsonwebtoken';
import * as dynamo from '../const/dynamo';
import { Jwt } from '../const/jwt';
import { Encryption } from '../const/encryption';
import { DynamoDB } from 'aws-sdk';
import { AccountAlreadyExists, AccountNotFound, DynamoException, EmptyRefreshToken, InvalidRefreshToken, LoginFailure } from '../const/exceptions';

export class DynamoService
{
    public dynamoDb: AWS.DynamoDB.DocumentClient;

    constructor(dynamoDb: AWS.DynamoDB.DocumentClient)
    {
        this.dynamoDb = dynamoDb;
    }

    async login(loginRequest: dynamo.LoginRequest)
    {
        const getRequest: dynamo.DynamoGetRequest = this.createAccountGetRequestForDynamo(loginRequest.username);
        const accountInfo = await dynamo.Dynamo.get(getRequest, this.dynamoDb);
        if (accountInfo?.Item !== undefined) {
            if (loginRequest.password === Encryption.decrypt(accountInfo.Item.Password)) {
                const userInfo = { username: accountInfo.Item.Username };
                const accessToken = Jwt.generateAccessToken(userInfo);
                const refreshToken = this.createRefreshTokenFromUsername(accountInfo.Item.Username);
                const newRefreshTokenParams: dynamo.DynamoPutRequest = this.createRefreshTokenPutRequestForDynamo(
                    loginRequest.username,
                    refreshToken);
                try {
                    dynamo.Dynamo.put(newRefreshTokenParams, this.dynamoDb);
                    return { accessToken, refreshToken };
                } catch(err) {
                    throw new DynamoException('Unable to add the refresh token to dynamo: ' + err.message);
                }
            } else {
                throw new LoginFailure('Failed to login');
            }
        } else {
            throw new AccountNotFound('No account found');
        }
    }

    async createAccount(createAccountRequest: dynamo.CreateAccountRequest)
    {
        const getRequest: dynamo.DynamoGetRequest = this.createAccountGetRequestForDynamo(createAccountRequest.username);
        const accountInfo = await dynamo.Dynamo.get(getRequest, this.dynamoDb);
        if (accountInfo.Item !== undefined)
            throw new AccountAlreadyExists('Account already exists');
        const putRequest = this.createAccountPutRequestForDynamo(
            createAccountRequest.username,
            createAccountRequest.password,
            createAccountRequest.email);
            dynamo.Dynamo.put(putRequest, this.dynamoDb);
    }

    async getAccountInfo(getAccountInfoRequest: dynamo.GetAccountInfoRequest)
    {
        const getRequest: dynamo.DynamoGetRequest = this.createAccountGetRequestForDynamo(getAccountInfoRequest.username);
        const accountInfo = await dynamo.Dynamo.get(getRequest, this.dynamoDb);
        if (accountInfo.Item !== undefined) {
            return {
                username: accountInfo.Item.Username,
                elo: accountInfo.Item.ELO,
                verified: accountInfo.Item.Verified
            }
        } else {
            throw new AccountNotFound('No account found');
        }
    }

    async updateRefreshToken(updateTokenRequest: dynamo.UpdateTokenRequest)
    {
        const refreshToken = updateTokenRequest.token;
        if (refreshToken == null)
            throw new EmptyRefreshToken('No refresh token provided');

        let decoded: string;
        try {
            decoded = jwt.verify(updateTokenRequest.token, process.env.REFRESH_TOKEN_SECRET);
        } catch (err) {
            throw new InvalidRefreshToken('Invalid refresh token, could not verify');
        }

        const username = (decoded as any).username;
        const getRequest: dynamo.DynamoGetRequest = this.createRefreshTokenGetRequestForDynamo(username);
        const tokenInfo = await dynamo.Dynamo.get(getRequest, this.dynamoDb);

        if (tokenInfo.Item?.RefreshToken !== updateTokenRequest.token)
            throw new InvalidRefreshToken('Invalid refresh token, local token did not match saved one');
        return { accessToken: Jwt.generateAccessToken({ username: (decoded as any).username }) };
    }

    async logout(logoutRequest: dynamo.LogoutRequest)
    {
        const deleteRequest: dynamo.DynamoDeleteRequest = this.createRefreshTokenDeleteRequestForDynamo(logoutRequest.username);
        dynamo.Dynamo.delete(deleteRequest, this.dynamoDb);
    }

    private createRefreshTokenPutRequestForDynamo(username: string, refreshToken: string): dynamo.DynamoPutRequest
    {
        return new dynamo.DynamoPutRequest('ChipsMMORefreshTokens', { Username: username, RefreshToken: refreshToken });
    }

    private createRefreshTokenGetRequestForDynamo(username: string): dynamo.DynamoGetRequest
    {
        return new dynamo.DynamoGetRequest('ChipsMMORefreshTokens', {
            Username: username
        });
    }

    private createRefreshTokenDeleteRequestForDynamo(username: string): dynamo.DynamoDeleteRequest
    {
        return new dynamo.DynamoDeleteRequest('ChipsMMORefreshTokens', {
            Username: username
        });
    }

    private createAccountGetRequestForDynamo(username: string): dynamo.DynamoGetRequest
    {
        return new dynamo.DynamoGetRequest('ChipsMMOAccounts', { Username: username });
    }

    private createAccountPutRequestForDynamo(
        username: string,
        password: string,
        email: string,
        verified: number = 0,
        elo: number = 1000,
        banned: number = 0)
    {
        return new dynamo.DynamoPutRequest('ChipsMMOAccounts', {
            Username: username,
            Password: Encryption.encrypt(password),
            Email: email,
            Verified: verified,
            ELO: elo,
            Banned: banned
        });
    }

    private createRefreshTokenFromUsername(username: DynamoDB.AttributeValue)
    {
        const userInfo = { username };
        return jwt.sign(userInfo, process.env.REFRESH_TOKEN_SECRET);
    }
}