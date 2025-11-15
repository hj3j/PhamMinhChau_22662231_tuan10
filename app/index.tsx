import { initDB } from "@/db/db";
import { Text, View } from "react-native";

export default function Index() {

  try {
     initDB()
  } catch (error) {
    
  }
 
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
