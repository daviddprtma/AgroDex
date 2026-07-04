import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class VerifyScreen extends StatefulWidget {
  final String batchIdOrCode;

  const VerifyScreen({super.key, required this.batchIdOrCode});

  @override
  State<VerifyScreen> createState() => _VerifyScreenState();
}

class _VerifyScreenState extends State<VerifyScreen> {
  final _supabase = Supabase.instance.client;
  bool _isLoading = true;
  String? _error;
  dynamic _verifyData;

  @override
  void initState() {
    super.initState();
    _fetchVerification();
  }

  Future<void> _fetchVerification() async {
    try {
      // First try to parse as JSON if it's from QR scanner
      String searchId = widget.batchIdOrCode;
      try {
        // If it's a JSON string like {"batchId": "uuid"}
        if (searchId.contains('batchId')) {
          final regex = RegExp(r'"batchId"\s*:\s*"([^"]+)"');
          final match = regex.firstMatch(searchId);
          if (match != null) {
            searchId = match.group(1)!;
          }
        }
      } catch (_) {}

      // Fetch batch data from Supabase DB to get token info
      final response = await _supabase
          .from('batches')
          .select()
          .eq('id', searchId)
          .maybeSingle();

      if (response == null) {
        throw Exception("Batch not found in database.");
      }

      final tokenId = response['hedera_token_id'];
      final serialNumber = response['hedera_serial_number'];

      if (tokenId == null || serialNumber == null) {
        throw Exception("This batch has not been tokenized yet.");
      }

      // Call verify-batch Edge Function
      final verifyRes = await _supabase.functions.invoke(
        'verify-batch',
        body: {'tokenId': tokenId, 'serialNumber': int.tryParse(serialNumber.toString()) ?? 1},
      );

      if (verifyRes.status == 200) {
        setState(() {
          _verifyData = verifyRes.data;
          _isLoading = false;
        });
      } else {
        throw Exception(verifyRes.data?['error'] ?? 'Verification failed');
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
        title: const Text('Batch Verification'),
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
              : _buildVerificationResult(),
    );
  }

  Widget _buildVerificationResult() {
    final aiSummary = _verifyData['ai_summary'];
    final trustScore = aiSummary?['trustScore'] ?? 0;
    final trustColor = trustScore >= 80 ? Colors.green : (trustScore >= 50 ? Colors.orange : Colors.red);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  const Text('AI Trust Score', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        height: 100,
                        width: 100,
                        child: CircularProgressIndicator(
                          value: trustScore / 100,
                          strokeWidth: 10,
                          color: trustColor,
                          backgroundColor: Colors.grey[200],
                        ),
                      ),
                      Text('$trustScore', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: trustColor)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (aiSummary != null && aiSummary['summary_en'] != null)
                    Text(aiSummary['summary_en'], textAlign: TextAlign.center),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Hedera NFT Certificate', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const Divider(),
                  _buildRow('Token ID', _verifyData['tokenId']?.toString() ?? 'N/A'),
                  _buildRow('Serial Number', _verifyData['serialNumber']?.toString() ?? 'N/A'),
                  _buildRow('Status', _verifyData['status']?.toString() ?? 'N/A'),
                  _buildRow('Verified At', _verifyData['verifiedAt'] != null ? DateTime.parse(_verifyData['verifiedAt']).toLocal().toString().split('.')[0] : 'N/A'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
          Text(value, style: const TextStyle(fontFamily: 'monospace')),
        ],
      ),
    );
  }
}
