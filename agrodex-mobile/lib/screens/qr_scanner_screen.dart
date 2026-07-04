import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:go_router/go_router.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  bool _isProcessing = false;

  void _onDetect(BarcodeCapture capture) {
    if (_isProcessing) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isNotEmpty) {
      final String? code = barcodes.first.rawValue;
      if (code != null) {
        setState(() {
          _isProcessing = true;
        });

        context.push('/verify', extra: code);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Code'),
        backgroundColor: const Color(0xFF10B981),
        foregroundColor: Colors.white,
      ),
      body: Stack(
        alignment: Alignment.center,
        children: [
          MobileScanner(
            onDetect: _onDetect,
            overlayBuilder: (context, constraints) {
              return Container(
                decoration: ShapeDecoration(
                  shape: QrScannerOverlayShape(
                    borderColor: const Color(0xFF10B981),
                    borderRadius: 10,
                    borderLength: 30,
                    borderWidth: 10,
                    cutOutSize: 300,
                  ),
                ),
              );
            },
          ),
          const Positioned(
            bottom: 50,
            child: Text(
              'Align QR code within the frame',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          )
        ],
      ),
    );
  }
}

// Simple overlay shape for the scanner
class QrScannerOverlayShape extends ShapeBorder {
  final Color borderColor;
  final double borderWidth;
  final double overlayColor;
  final double borderRadius;
  final double borderLength;
  final double cutOutSize;

  QrScannerOverlayShape({
    this.borderColor = Colors.red,
    this.borderWidth = 3.0,
    this.overlayColor = 150.0,
    this.borderRadius = 0,
    this.borderLength = 40,
    this.cutOutSize = 250,
  });

  @override
  EdgeInsetsGeometry get dimensions => const EdgeInsets.all(10.0);

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) {
    return Path()
      ..fillType = PathFillType.evenOdd
      ..addPath(getOuterPath(rect), Offset.zero);
  }

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    Path _getLeftTopPath(Rect rect) {
      return Path()
        ..moveTo(rect.left, rect.bottom)
        ..lineTo(rect.left, rect.top)
        ..lineTo(rect.right, rect.top);
    }

    return _getLeftTopPath(rect)
      ..lineTo(rect.right, rect.bottom)
      ..lineTo(rect.left, rect.bottom)
      ..lineTo(rect.left, rect.top);
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    final width = rect.width;
    final borderWidthSize = width / 2;
    final height = rect.height;
    final borderHeightSize = height / 2;
    final borderSize = cutOutSize / 2;

    var paint = Paint()
      ..color = Colors.black.withOpacity(0.5)
      ..style = PaintingStyle.fill;

    canvas.drawPath(
      Path()
        ..addRect(rect)
        ..addRRect(RRect.fromRectAndRadius(
          Rect.fromCenter(
            center: Offset(width / 2, height / 2),
            width: cutOutSize,
            height: cutOutSize,
          ),
          Radius.circular(borderRadius),
        ))
        ..fillType = PathFillType.evenOdd,
      paint,
    );

    var borderPaint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = borderWidth;

    var path = Path();
    
    // Top left
    path.moveTo(width / 2 - borderSize, height / 2 - borderSize + borderLength);
    path.lineTo(width / 2 - borderSize, height / 2 - borderSize);
    path.lineTo(width / 2 - borderSize + borderLength, height / 2 - borderSize);
    
    // Top right
    path.moveTo(width / 2 + borderSize - borderLength, height / 2 - borderSize);
    path.lineTo(width / 2 + borderSize, height / 2 - borderSize);
    path.lineTo(width / 2 + borderSize, height / 2 - borderSize + borderLength);
    
    // Bottom left
    path.moveTo(width / 2 - borderSize, height / 2 + borderSize - borderLength);
    path.lineTo(width / 2 - borderSize, height / 2 + borderSize);
    path.lineTo(width / 2 - borderSize + borderLength, height / 2 + borderSize);
    
    // Bottom right
    path.moveTo(width / 2 + borderSize - borderLength, height / 2 + borderSize);
    path.lineTo(width / 2 + borderSize, height / 2 + borderSize);
    path.lineTo(width / 2 + borderSize, height / 2 + borderSize - borderLength);
    
    canvas.drawPath(path, borderPaint);
  }

  @override
  ShapeBorder scale(double t) {
    return QrScannerOverlayShape(
      borderColor: borderColor,
      borderWidth: borderWidth * t,
      overlayColor: overlayColor,
      borderRadius: borderRadius * t,
      borderLength: borderLength * t,
      cutOutSize: cutOutSize * t,
    );
  }
}
