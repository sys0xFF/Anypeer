using System.Drawing;
using System.Drawing.Imaging;
using System.Windows.Forms;
using System.Linq;
using System.IO;

namespace ScreenServer
{
    class ScreenCapturer
    {
        public static byte[] CaptureAsJpeg(long quality = 70L)
        {
            Rectangle bounds = System.Windows.Forms.Screen.PrimaryScreen.Bounds;
            using (Bitmap bmp = new Bitmap(bounds.Width, bounds.Height))
            using (Graphics g = Graphics.FromImage(bmp))
            {
                g.CopyFromScreen(Point.Empty, Point.Empty, bounds.Size);
                using (MemoryStream ms = new MemoryStream())
                {
                    ImageCodecInfo jpgEncoder = GetEncoder(ImageFormat.Jpeg);
                    EncoderParameters encParams = new EncoderParameters(1);
                    encParams.Param[0] = new EncoderParameter(Encoder.Quality, quality);
                    bmp.Save(ms, jpgEncoder, encParams);
                    return ms.ToArray();
                }
            }
        }

        private static ImageCodecInfo GetEncoder(ImageFormat format)
        {
            return ImageCodecInfo.GetImageDecoders()
                .FirstOrDefault(c => c.FormatID == format.Guid);
        }
    }
}
