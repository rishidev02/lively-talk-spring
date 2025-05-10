
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [backendUrl, setBackendUrl] = useState("http://localhost:8081");
  const [testStatus, setTestStatus] = useState("");

  const testBackendConnection = async () => {
    try {
      setTestStatus("Testing connection...");
      const response = await fetch(`${backendUrl}/api/health`);
      if (response.ok) {
        setTestStatus("✅ Connected successfully! Backend is running.");
      } else {
        setTestStatus("❌ Connection failed. Backend might be down or URL is incorrect.");
      }
    } catch (error) {
      setTestStatus("❌ Connection error. Make sure your Spring Boot application is running.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">Real-Time Chat Application</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Backend Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="backend-url" className="block text-sm font-medium mb-1">
                    Backend URL
                  </label>
                  <Input 
                    id="backend-url"
                    value={backendUrl} 
                    onChange={(e) => setBackendUrl(e.target.value)} 
                    placeholder="http://localhost:8081"
                  />
                </div>
                <Button onClick={testBackendConnection}>Test Connection</Button>
                {testStatus && (
                  <div className={`mt-2 text-sm ${testStatus.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                    {testStatus}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Follow these steps to set up your chat application backend:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Clone the Spring Boot backend repository</li>
                <li>Set up MySQL database using the provided schema</li>
                <li>Run the Spring Boot application</li>
                <li>Test the API endpoints using Postman</li>
                <li>Connect this frontend to your running backend</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">/api/health</td>
                      <td className="px-6 py-4 whitespace-nowrap">GET</td>
                      <td className="px-6 py-4">Check if the backend is running</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">/api/auth/register</td>
                      <td className="px-6 py-4 whitespace-nowrap">POST</td>
                      <td className="px-6 py-4">Register a new user</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">/api/auth/login</td>
                      <td className="px-6 py-4 whitespace-nowrap">POST</td>
                      <td className="px-6 py-4">Login a user</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">/api/rooms</td>
                      <td className="px-6 py-4 whitespace-nowrap">GET</td>
                      <td className="px-6 py-4">Get all chat rooms</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">/api/rooms</td>
                      <td className="px-6 py-4 whitespace-nowrap">POST</td>
                      <td className="px-6 py-4">Create a new chat room</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">/api/rooms/{'{id}'}/messages</td>
                      <td className="px-6 py-4 whitespace-nowrap">GET</td>
                      <td className="px-6 py-4">Get messages in a chat room</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">/api/messages</td>
                      <td className="px-6 py-4 whitespace-nowrap">POST</td>
                      <td className="px-6 py-4">Send a message</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <h3 className="font-semibold mb-2">Backend Resources</h3>
          <p>
            You can download the complete Spring Boot backend code from this 
            <a href="#" className="text-blue-600 hover:underline font-medium"> GitHub repository link</a>.
            Follow the README instructions to set up and run the application.
          </p>
        </div>

        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          <h3 className="font-semibold mb-2">MySQL Database Setup</h3>
          <p className="mb-2">
            Run the following SQL script in MySQL Workbench to create the necessary database and tables:
          </p>
          <div className="bg-white p-3 rounded border border-green-200 overflow-x-auto">
            <pre className="text-xs">
{`CREATE DATABASE IF NOT EXISTS chat_application;
USE chat_application;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT FALSE
);

CREATE TABLE chat_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id)
);

CREATE TABLE user_room (
    user_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, room_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id)
);`}
            </pre>
          </div>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <h3 className="font-semibold mb-2">Testing with Postman</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open Postman and create a new collection for "Chat Application"</li>
            <li>Set up the following requests:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Health Check: GET http://localhost:8081/api/health</li>
                <li>Register: POST http://localhost:8081/api/auth/register with JSON body containing username, password, email, and fullName</li>
                <li>Login: POST http://localhost:8081/api/auth/login with JSON body containing username and password</li>
                <li>Create Room: POST http://localhost:8081/api/rooms with JWT token in Authorization header and JSON body containing name and description</li>
                <li>Get Rooms: GET http://localhost:8081/api/rooms with JWT token in Authorization header</li>
                <li>Send Message: POST http://localhost:8081/api/messages with JWT token and JSON body containing content and roomId</li>
                <li>Get Messages: GET http://localhost:8081/api/rooms/{'{roomId}'}/messages with JWT token</li>
              </ul>
            </li>
            <li>For authenticated endpoints, add the JWT token received from login to the Authorization header as "Bearer {'{token}'}"</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Index;
