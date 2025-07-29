import { useParams } from "wouter";

export default function TestRoom() {
  const { id: roomId } = useParams<{ id: string }>();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
        <h1 className="text-xl font-semibold">Комната: {roomId}</h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Тестовая страница</h2>
          <p className="text-gray-600">ID комнаты: {roomId}</p>
          <p className="text-green-600 mt-2">Если вы видите это сообщение, то маршрутизация работает!</p>
        </div>
      </div>
    </div>
  );
}