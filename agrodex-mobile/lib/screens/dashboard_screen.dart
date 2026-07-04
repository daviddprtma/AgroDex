import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AgroDex Dashboard'),
        backgroundColor: const Color(0xFF10B981),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await Supabase.instance.client.auth.signOut();
              if (context.mounted) context.go('/');
            },
          )
        ],
      ),
      body: GridView.count(
        padding: const EdgeInsets.all(16),
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        children: [
          _buildCard(
            context,
            icon: Icons.map,
            title: 'Explore Map',
            onTap: () => context.push('/map'),
          ),
          _buildCard(
            context,
            icon: Icons.qr_code_scanner,
            title: 'Scan QR',
            onTap: () => context.push('/scan'),
          ),
          _buildCard(
            context,
            icon: Icons.inventory,
            title: 'My Batches',
            onTap: () => context.push('/batches'),
          ),
          _buildCard(
            context,
            icon: Icons.precision_manufacturing,
            title: 'Tokenize',
            onTap: () => context.push('/tokenize'),
          ),
          _buildCard(
            context,
            icon: Icons.app_registration,
            title: 'Register Batch',
            onTap: () => context.push('/register'),
          ),
          _buildCard(
            context,
            icon: Icons.security,
            title: 'Risk Intel',
            onTap: () => context.push('/risk'),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(BuildContext context, {required IconData icon, required String title, required VoidCallback onTap}) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: const Color(0xFF10B981)),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }
}
