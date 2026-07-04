import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class RiskScreen extends StatefulWidget {
  const RiskScreen({super.key});

  @override
  State<RiskScreen> createState() => _RiskScreenState();
}

class _RiskScreenState extends State<RiskScreen> {
  final _supabase = Supabase.instance.client;
  bool _isLoading = true;
  String? _error;
  dynamic _statsData;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    try {
      final response = await _supabase.functions.invoke('dashboard-stats');
      if (response.status == 200) {
        setState(() {
          _statsData = response.data;
          _isLoading = false;
        });
      } else {
        throw Exception(response.data?['error'] ?? 'Failed to fetch risk stats');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Risk Intelligence'),
        backgroundColor: const Color(0xFF10B981),
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 64, color: Colors.red),
                        const SizedBox(height: 16),
                        Text(_error!, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16)),
                      ],
                    ),
                  ),
                )
              : _buildStats(),
    );
  }

  Widget _buildStats() {
    final stats = _statsData['summary'] ?? {};
    final levelCounts = _statsData['levelCounts'] ?? {};
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Fraud Detection Overview',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildStatCard('Total Analyzed', stats['totalAnalyzed']?.toString() ?? '0', Colors.blue),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildStatCard('Safe Rate', '${(stats['safeRate'] ?? 0).toStringAsFixed(1)}%', Colors.green),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text('Risk Levels', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          _buildRiskBar('SAFE', levelCounts['SAFE'] ?? 0, Colors.green),
          _buildRiskBar('LOW', levelCounts['LOW'] ?? 0, Colors.lightGreen),
          _buildRiskBar('MEDIUM', levelCounts['MEDIUM'] ?? 0, Colors.orange),
          _buildRiskBar('HIGH', levelCounts['HIGH'] ?? 0, Colors.deepOrange),
          _buildRiskBar('CRITICAL', levelCounts['CRITICAL'] ?? 0, Colors.red),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(title, style: const TextStyle(fontSize: 14, color: Colors.grey)),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
      ),
    );
  }

  Widget _buildRiskBar(String label, int count, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          SizedBox(width: 80, child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold))),
          const SizedBox(width: 8),
          Expanded(
            child: LinearProgressIndicator(
              value: count > 0 ? 1.0 : 0.0, // Simplified visualization
              color: color,
              backgroundColor: color.withOpacity(0.2),
              minHeight: 12,
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(width: 40, child: Text('$count', textAlign: TextAlign.end)),
        ],
      ),
    );
  }
}
