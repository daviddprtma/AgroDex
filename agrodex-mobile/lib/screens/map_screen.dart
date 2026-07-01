import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:math';
import 'package:url_launcher/url_launcher.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final _supabase = Supabase.instance.client;
  bool _isLoading = true;
  List<dynamic> _batches = [];
  
  // Base coordinates for regions
  final Map<String, LatLng> _regionCoordinates = {
    'lampung': const LatLng(-4.5586, 105.4068),
    'sumatra': const LatLng(-0.5897, 101.3431),
    'java': const LatLng(-7.6145, 110.7122),
    'bali': const LatLng(-8.4095, 115.1889),
    'kalimantan': const LatLng(1.4326, 114.1511),
    'sulawesi': const LatLng(-1.4300, 121.4456),
    'papua': const LatLng(-4.2699, 138.0803),
    'jakarta': const LatLng(-6.2088, 106.8456),
    'bandung': const LatLng(-6.9175, 107.6191),
    'surabaya': const LatLng(-7.2504, 112.7688),
    'default': const LatLng(-0.7893, 113.9213), // Center of Indonesia
  };

  @override
  void initState() {
    super.initState();
    _fetchBatches();
  }

  Future<void> _fetchBatches() async {
    try {
      final response = await _supabase
          .from('batches')
          .select('id, batch_name, location, quantity, status, ai_analysis, hcs_tx_id, farmer_id, harvest_date')
          .order('created_at', ascending: false);
      
      if (mounted) {
        setState(() {
          _batches = response;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching batches for map: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  LatLng _getCoordinates(String? locationStr) {
    if (locationStr == null || locationStr.isEmpty) return _regionCoordinates['default']!;
    
    final loc = locationStr.toLowerCase();
    for (var entry in _regionCoordinates.entries) {
      if (loc.contains(entry.key)) {
        // Add random jitter so markers in same region don't overlap completely
        final rnd = Random();
        final jitterLat = (rnd.nextDouble() - 0.5) * 0.5;
        final jitterLng = (rnd.nextDouble() - 0.5) * 0.5;
        return LatLng(entry.value.latitude + jitterLat, entry.value.longitude + jitterLng);
      }
    }
    
    // Default center with wider jitter
    final rnd = Random();
    final jitterLat = (rnd.nextDouble() - 0.5) * 5.0;
    final jitterLng = (rnd.nextDouble() - 0.5) * 10.0;
    return LatLng(_regionCoordinates['default']!.latitude + jitterLat, _regionCoordinates['default']!.longitude + jitterLng);
  }

  void _showBatchPopup(Map<String, dynamic> batch) {
    final riskLevel = batch['ai_analysis']?['riskLevel'] ?? 'Unknown';
    Color riskColor = Colors.grey;
    if (riskLevel.toString().toLowerCase() == 'low') riskColor = Colors.green;
    if (riskLevel.toString().toLowerCase() == 'medium') riskColor = Colors.orange;
    if (riskLevel.toString().toLowerCase() == 'high') riskColor = Colors.red;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              batch['batch_name'] ?? 'Unnamed Batch',
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: riskColor.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                  child: Text('$riskLevel Risk', style: TextStyle(color: riskColor, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: Text(batch['status'] ?? 'registered', style: TextStyle(color: Colors.blue[700], fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text('Location: ${batch['location'] ?? 'Unknown'}', style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 8),
            Text('Quantity: ${batch['quantity'] ?? 'N/A'} kg', style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 8),
            Text('Farmer ID: ${batch['farmer_id']?.toString().substring(0, 8) ?? 'Unknown'}...', style: const TextStyle(fontSize: 16)),
            
            if (batch['hcs_tx_id'] != null) ...[
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    final url = Uri.parse('https://hashscan.io/testnet/transaction/${batch['hcs_tx_id']}');
                    if (await canLaunchUrl(url)) {
                      await launchUrl(url);
                    }
                  },
                  icon: const Icon(Icons.open_in_new),
                  label: const Text('View on HashScan'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              )
            ]
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: Color(0xFF10B981))),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Supply Chain Map'),
        backgroundColor: const Color(0xFF10B981),
        foregroundColor: Colors.white,
      ),
      body: FlutterMap(
        options: MapOptions(
          initialCenter: _regionCoordinates['default']!,
          initialZoom: 5.0,
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.agrodex.mobile',
          ),
          MarkerLayer(
            markers: _batches.map((batch) {
              final position = _getCoordinates(batch['location']);
              return Marker(
                point: position,
                width: 40,
                height: 40,
                child: GestureDetector(
                  onTap: () => _showBatchPopup(batch),
                  child: const Icon(
                    Icons.location_on,
                    color: Colors.red,
                    size: 40,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
