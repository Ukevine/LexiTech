import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '../../components/CustomDrawerContent';
import { colors } from '../../constants/theme';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        drawerStyle: { backgroundColor: colors.background, width: 300 },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Dictionary',
          drawerLabel: 'Search',
        }}
      />
      <Drawer.Screen
        name="word"
        options={{
          title: 'Word Details',
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );
}
