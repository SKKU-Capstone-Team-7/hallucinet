package auth

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/SKKU-Capstone-Team-7/hallucinet/cli/types"
	"github.com/golang-jwt/jwt/v5"
)

var ErrInvalidToken = errors.New("invalid token")

var (
	backendEndpoint      = "http://localhost/api/v1"
	frontendEndpoint     = "http://localhost"
	coordinationEndpoint = "http://localhost/api/coordination"
)

func DecodeDeviceToken(tokenString string) (types.DeviceToken, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return []byte("hallucinet"), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
	if err != nil {
		return types.DeviceToken{}, ErrInvalidToken
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok {
		return types.DeviceToken{}, ErrInvalidToken
	}

	expiration, err := claims.GetExpirationTime()
	if err != nil {
		return types.DeviceToken{}, err
	}

	return types.DeviceToken{
		DeviceId:   claims["deviceId"].(string),
		Expiration: expiration.Time,
	}, nil
}

func Authenticate(tokenPath string) (types.DeviceToken, error) {
	_, err := os.Stat(tokenPath)
	if err == nil {
		// Token file exists
		tokenData, err := os.ReadFile(tokenPath)
		token, err := DecodeDeviceToken(string(tokenData))
		// Token is valid and not expired
		if err == nil && token.Expiration.After(time.Now()) {
			return token, nil
		}
	}

	// No valid token... register device
	token, err := registerDevice()
	os.WriteFile(tokenPath, []byte(token), 0600)

	return types.DeviceToken{}, err
}

func registerDevice() (string, error) {
	deviceId, err := createAuthRequest()
	if err != nil {
		return "", err
	}
	fmt.Printf("Visit %v/confirm-device?deviceId=%v to confirm\n", frontendEndpoint, deviceId)

	// Loop until device is confirmed
	for {
		isConfirmed, err := IsDeviceAuthConfirmed(deviceId)
		if err != nil {
			return "", err
		}
		if isConfirmed {
			break
		}

		time.Sleep(5 * time.Second)
	}

	// Create token
	jwt, err := createJWT(deviceId)
	if err != nil {
		return "", err
	}
	return jwt, err
}

type AuthRequestDto struct {
	Id  string `json:"$id"`
	Url string `json:"url"`
}

func createAuthRequest() (string, error) {
	URL := backendEndpoint + "/devices/auth"
	hostname, err := os.Hostname()
	if err != nil {
		return "", err
	}

	resp, err := http.PostForm(URL, url.Values{
		"name": {hostname},
	})
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	var dto AuthRequestDto
	json.Unmarshal(body, &dto)

	return dto.Id, nil
}

type TokenDto struct {
	Token string `json:"token"`
}

func createJWT(deviceId string) (string, error) {
	URL := coordinationEndpoint + "/token"

	log.Printf("Creating token for %v", deviceId)
	resp, err := http.PostForm(URL, url.Values{
		"deviceId": {deviceId},
	})
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var token TokenDto
	json.Unmarshal(body, &token)
	return token.Token, nil
}

func IsDeviceAuthConfirmed(deviceId string) (bool, error) {
	URL := backendEndpoint + "/devices/" + deviceId
	resp, err := http.Get(URL)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, err
	}

	var resJson map[string]json.RawMessage
	err = json.Unmarshal(body, &resJson)
	if err != nil {
		return false, err
	}

	_, hasUser := resJson["user"]
	return hasUser, nil
}
