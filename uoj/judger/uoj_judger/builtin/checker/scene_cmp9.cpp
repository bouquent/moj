#include "testlib.h"

#include <unistd.h>
#include <string>

using namespace std;

int main(int argc, char * argv[])
{
    registerTestlibCmd(argc, argv);
    
	bool is_success=false;
	while (!ouf.seekEof()) {
		std::string buf;
		ouf.readLineTo(buf);
		if (buf.substr(0, 17) == "current items is:") {
			//analyze hero level
			std::string hero_name;
			for (size_t i = 0; i < buf.size(); ++i) {
				if (buf[i] == ',' || i == buf.size() - 1) {
					if (hero_name == "hero_5") {
						is_success = true;
						break;
					}  else {
						hero_name = "";
					}
				} else {
					hero_name.push_back(buf[i]);
				}
			}
		}
	}
	if (is_success == true) {
    	quitf(_ok, "1 numbers");
	} else {
		quitf(_wa, "answer wrong");
	}
}
